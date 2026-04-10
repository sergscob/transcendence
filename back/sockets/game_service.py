import asyncio
from typing import Any, Dict, TypedDict
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.apps import apps

class PlayerState(TypedDict, total=False):
    user_id: int
    pos: list[float]
    rockets: list[dict[str, Any]]

class MatchState(TypedDict, total=False):
    time: str
    status: str
    max_players: int
    online_players: int
    live_players: int
    players: Dict[int, PlayerState]

RoomStateByMatch = Dict[str, MatchState]


ROOM_GAME_STATE_BY_MATCH: RoomStateByMatch = {}


@database_sync_to_async
def _get_match_record(match_id):
    Match = apps.get_model('match', 'Match')
    match_record = Match.objects.filter(id=match_id).first()
    print (f"Fetched match record for match_id {match_id}: {match_record}")
    if match_record is None:
        return None
    return match_record


async def _new_match_state(match_id):
    match_record = await _get_match_record(match_id)
    return {
        'time': '00:00',
        'status': match_record.status if match_record else 'waiting',
        'max_players': match_record.players_maxcount if match_record else 1,
        'started_at': match_record.started_at.isoformat() if match_record and match_record.started_at else None,
        'online_players': 1,
        'live_players': 1,
        'players': {},
    }

async def get_match_state(match_id: str) -> MatchState:
    state = ROOM_GAME_STATE_BY_MATCH.get(match_id)
    if state is None:
        print (f"Match state for match_id {match_id} not found, creating new one.")
        state = await _new_match_state(match_id)
        ROOM_GAME_STATE_BY_MATCH[match_id] = state
    return state
    


async def add_new_player(match_state, userInfo):
    print (f"Adding new player to match state: {userInfo}")
    players = match_state.get('players', {})
    userInfo['health'] = 100
    userInfo['score'] = 0
    players[userInfo['user_id']] = userInfo


async def update_player(match_id, userInfo):
    match_state = await get_match_state(match_id)

    players = match_state.get('players', {})
    curUser = players.get(userInfo['user_id'])
    if curUser is None:
        await add_new_player(match_state, userInfo)
    else:                
        existing_info = players.get(userInfo['user_id'], {})
        existing_info.update(userInfo)
        players[userInfo['user_id']] = existing_info


def disconnect_player(match_id, user_id):
    ROOM_GAME_STATE_BY_MATCH.pop(match_id, None)



async def shot_user(match_id, user_id, shot_id, damage, score):
    print (f"Processing shot from user {user_id} with shot_id {shot_id}")

    match_state = await get_match_state(match_id)
    players = match_state.get('players', {})
    curUser = players.get(user_id)
    shotUser = players.get(shot_id)
    if curUser is not None:
        curUser['score'] = curUser.get('score', 0) + score
    if shotUser is not None:
        shotUser['health'] = shotUser.get('health', 100) - damage
