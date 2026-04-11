import asyncio
from typing import Any, Dict, TypedDict
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .game_service import get_match_state, add_new_player, update_player, shot_user

ROOM_LOCK: asyncio.Lock = asyncio.Lock()
ROOM_BROADCAST_TASKS: Dict[str, asyncio.Task] = {}
SEND_INTERVAL = 0.016


async def _broadcast_room_state(channel_layer, room_group_name: str, match_id: str):
    try:
        while True:
            await asyncio.sleep(SEND_INTERVAL)

            async with ROOM_LOCK:
                match_state = await get_match_state(match_id)

            if match_state is None or match_state.get('status') != 'live' :
                continue

            await channel_layer.group_send(
                room_group_name,
                {
                    'type': 'room_state',
                    'payload': match_state,
                },
            )
    except asyncio.CancelledError:
        return
    finally:
        async with ROOM_LOCK:
            task = ROOM_BROADCAST_TASKS.get(match_id)
            if task is asyncio.current_task():
                ROOM_BROADCAST_TASKS.pop(match_id, None)



class PlayerConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        url_route = self.scope.get("url_route", {})
        kwargs = url_route.get("kwargs", {})
        self.match_id = kwargs.get("match_id")        
        if not self.match_id:
            await self.close(code=4400)
            return

        self.room_group_name = f'game_{self.match_id}'
        self.user_id = None

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        async with ROOM_LOCK:
            task = ROOM_BROADCAST_TASKS.get(self.match_id)
            if task is None or task.done():
                ROOM_BROADCAST_TASKS[self.match_id] = asyncio.create_task(
                    _broadcast_room_state(self.channel_layer, self.room_group_name, self.match_id)
                )

        await self.accept()
        # await self.send_room_state()

    async def disconnect(self, close_code):
        should_cancel_task = False
        task_to_cancel = None

        async with ROOM_LOCK:
            room_state = await get_match_state(self.match_id)
            if room_state is not None and self.user_id is not None:
                players = room_state.setdefault('players', {})
                players.pop(self.user_id, None)

            if room_state is not None and not room_state.get('players'):
                disconnect_player(self.match_id, self.user_id)
                task_to_cancel = ROOM_BROADCAST_TASKS.pop(self.match_id, None)
                should_cancel_task = task_to_cancel is not None

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        if should_cancel_task:
            task_to_cancel.cancel()

    async def receive_json(self, content, **kwargs):
        message_type = content.get('type', 'state')
        user_id = content.get('user_id')
        if user_id is None :
            return
        self.user_id = user_id

        if message_type == 'state':
            state = content.get('state')
            await self.update_game_state(user_id, state)
            return

        if message_type == 'shot':
            user_id = content.get('user_id')
            shot_id = content.get('shot_id')
            damage = content.get('damage', 10)
            score = content.get('score', 10)
            await shot_user(self.match_id, user_id, shot_id, damage, score)
            return


        print(f"Received unknown message from user {user_id} in match {self.match_id}: {content}")


    async def room_state(self, event):
        await self.send_json({
            'type': 'state',
            'matchState': event.get('payload'),
        })

    async def start(self, event):
        payload = event.get('payload', [])
        await self.send_json({
            'type': 'start',
            'players': payload,
        })

    async def stop(self, event):
        payload = event.get('payload', [])
        await self.send_json({
            'type': 'stop',
            'players': payload,
        })


    async def update_game_state(self, user_id: int, state: Any):
        async with ROOM_LOCK:
            if isinstance(state, dict):
                userInfo = dict(state)
                userInfo['user_id'] = user_id
                await update_player(self.match_id, userInfo)
