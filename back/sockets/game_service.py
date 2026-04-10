import asyncio
from typing import Any, Dict, TypedDict
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.apps import apps
from django.utils import timezone

class PlayerState(TypedDict, total=False):
    user_id: int
    pos: list[float]
    rockets: list[dict[str, Any]]

class MatchState(TypedDict, total=False):
    match_id: str
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
        'match_id': match_id,
        'time': '00:00',
        'status': match_record.status if match_record else 'waiting',
        'max_players': match_record.players_maxcount if match_record else 1,
        'started_at': None,
        'online_players': 1,
        'live_players': 1,
        'players': {},
    }


@database_sync_to_async
def _save_match_start(match_id):
    Match = apps.get_model('match', 'Match')
    match_record = Match.objects.filter(id=match_id).first()
    if match_record:
        match_record.status = 'live'
        match_record.started_at = timezone.now()
        match_record.save(update_fields=['status', 'started_at'])
        print (f"Match LIVE {match_id}")
        return True
    return False



@database_sync_to_async
def _save_match_finish(match_id):
    Match = apps.get_model('match', 'Match')
    match_record = Match.objects.filter(id=match_id).first()
    if match_record:
        match_record.status = 'finished'
        match_record.finished_at = timezone.now()
        match_record.save(update_fields=['status', 'finished_at'])
        print (f"Match FINISHED {match_id}")
        return True
    return False



async def get_match_state(match_id: str) -> MatchState:
    state = ROOM_GAME_STATE_BY_MATCH.get(match_id)
    if state is None:
        print (f"Match state for match_id {match_id} not found, creating new one.")
        state = await _new_match_state(match_id)
        ROOM_GAME_STATE_BY_MATCH[match_id] = state
    return state
    


async def add_new_player(match_state, userInfo):
    print (f"Adding new player to match state: {userInfo['user_id']}")
    players = match_state.get('players', {})
    userInfo['health'] = 100
    userInfo['score'] = 0
    players[userInfo['user_id']] = userInfo
    match_state['online_players'] = players.__len__()
    print (f"match_state['online_players']: {match_state['online_players']} {match_state['status']}")

    if match_state['online_players'] >= match_state['max_players'] and match_state['status'] == 'waiting':
        print (f"Max players reached for match_id {match_state['match_id']}. Starting match.")
        match_state['status'] = 'live'
        await _save_match_start(match_state['match_id'])


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
        if shotUser['health'] <= 0:
            shotUser['health'] = 0
            match_state['live_players'] = match_state.get('live_players', 1) - 1
            print (f"Live players updated: {match_state['live_players']}")
            if match_state['live_players'] <= 1:
                match_state['status'] = 'finished'
                print (f"Match state updated to FINISHED")
                await _save_match_finish(match_id)
