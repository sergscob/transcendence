import asyncio
from typing import Any, Dict

from channels.generic.websocket import AsyncJsonWebsocketConsumer

ROOM_GROUP_NAME = 'game_1'

ROOM_GAME_STATE: Dict[int, Dict[str, Any]] = {}
ROOM_LOCK: asyncio.Lock = asyncio.Lock()
ROOM_BROADCAST_TASK: asyncio.Task | None = None
SEND_INTERVAL = 0.016

async def _broadcast_room_state(channel_layer):
    try:
        while True:
            await asyncio.sleep(SEND_INTERVAL)

            async with ROOM_LOCK:
                states = list(ROOM_GAME_STATE.values())

            await channel_layer.group_send(
                ROOM_GROUP_NAME,
                {
                    'type': 'room_state',
                    'states': states,
                },
            )
    except asyncio.CancelledError:
        return


class PlayerConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        self.room_group_name = ROOM_GROUP_NAME
        self.user_id = None

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        global ROOM_BROADCAST_TASK
        if ROOM_BROADCAST_TASK is None or ROOM_BROADCAST_TASK.done():
            ROOM_BROADCAST_TASK = asyncio.create_task(_broadcast_room_state(self.channel_layer))

        await self.accept()
        await self.send_room_state()

    async def disconnect(self, close_code):
        if self.user_id is not None:
            async with ROOM_LOCK:
                ROOM_GAME_STATE.pop(self.user_id, None)

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        # { user_id, state: {pos: [x,y,z], rockets: [{rocket_id, pos:[x,y,z]}]} }
        user_id = content.get('user_id')
        state = content.get('state')
        if user_id is None:
            return
        self.user_id = user_id

        await self.update_game_state(user_id, state)

    async def room_state(self, event):
        await self.send_json(event.get('states', []))

    async def send_room_state(self):
        async with ROOM_LOCK:
            states = list(ROOM_GAME_STATE.values())
        await self.send_json(states)

    async def update_game_state(self, user_id: int, state: Any):
        async with ROOM_LOCK:
            if isinstance(state, dict):
                merged = dict(state)
                merged['user_id'] = user_id
                ROOM_GAME_STATE[user_id] = merged
                return
