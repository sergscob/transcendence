import asyncio
from typing import Any, Dict, TypedDict
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class PlayerState(TypedDict, total=False):
    user_id: int
    pos: list[float]
    rockets: list[dict[str, Any]]

class MatchState(TypedDict, total=False):
    time: str
    status: str
    players: Dict[int, PlayerState]

RoomStateByMatch = Dict[str, MatchState]

ROOM_GAME_STATE_BY_MATCH: RoomStateByMatch = {}
ROOM_LOCK: asyncio.Lock = asyncio.Lock()
ROOM_BROADCAST_TASKS: Dict[str, asyncio.Task] = {}
SEND_INTERVAL = 0.016


def _new_match_state(match_id):
    print (f"Creating new match state for match_id: {match_id}")
    return {
        'time': '0',
        'status': 'waiting',
        'players': {},
    }


async def broadcast_match_start(channel_layer, match_id: str, payload: Dict[str, Any] | None = None):
    event = {
        'type': 'game_start',
        'payload': payload or {},
    }
    await channel_layer.group_send(f'game_{match_id}', event)


async def _broadcast_room_state(channel_layer, room_group_name: str, match_id: str):
    try:
        while True:
            await asyncio.sleep(SEND_INTERVAL)

            async with ROOM_LOCK:
                match_state = ROOM_GAME_STATE_BY_MATCH.get(match_id, _new_match_state(match_id))

            await channel_layer.group_send(
                room_group_name,
                {
                    'type': 'room_state',
                    'match_state': match_state,
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
            ROOM_GAME_STATE_BY_MATCH.setdefault(self.match_id, _new_match_state(self.match_id))
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
            room_state = ROOM_GAME_STATE_BY_MATCH.get(self.match_id)
            if room_state is not None and self.user_id is not None:
                players = room_state.setdefault('players', {})
                players.pop(self.user_id, None)

            if room_state is not None and not room_state.get('players'):
                ROOM_GAME_STATE_BY_MATCH.pop(self.match_id, None)
                task_to_cancel = ROOM_BROADCAST_TASKS.pop(self.match_id, None)
                should_cancel_task = task_to_cancel is not None

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        if should_cancel_task:
            task_to_cancel.cancel()

    async def receive_json(self, content, **kwargs):
        message_type = content.get('type', 'state')
        room_match_id = content.get('match_id')
        user_id = content.get('user_id')
        if user_id is None or str(room_match_id) != self.match_id:
            return
        self.user_id = user_id

        if message_type == 'state':
            state = content.get('state')
            await self.update_game_state(user_id, state)
            return
        
        print(f"Received unknown message from user {user_id} in match {self.match_id}: {content}")

    async def room_state(self, event):
        await self.send_json({
            'type': 'state',
            'matchState': event.get('match_state', _new_match_state(self.match_id)),
        })

    async def game_start(self, event):
        await self.send_json({
            'type': 'start',
            **event.get('payload', {}),
        })

    # async def send_room_state(self):
    #     async with ROOM_LOCK:
    #         states = list(ROOM_GAME_STATE_BY_MATCH.get(self.match_id, {}).values())
    #     await self.send_json({
    #         'type': 'state',
    #         'states': states,
    #     })

    async def update_game_state(self, user_id: int, state: Any):
        async with ROOM_LOCK:
            if isinstance(state, dict):
                merged = dict(state)
                merged['user_id'] = user_id
                match_state = ROOM_GAME_STATE_BY_MATCH.setdefault(self.match_id, _new_match_state(self.match_id))
                players = match_state.setdefault('players', {})
                players[user_id] = merged
                return
