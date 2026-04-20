import asyncio
from typing import Any, Dict, TypedDict

from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
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
    time_limit: int
    max_players: int
    online_players: int
    live_players: int
    started_at: Any
    players: Dict[int, PlayerState]


RoomStateByMatch = Dict[str, MatchState]


ROOM_LOCK: asyncio.Lock = asyncio.Lock()
ROOM_GAME_STATE_BY_MATCH: RoomStateByMatch = {}
DEFAULT_MATCH_TIME_LIMIT = 600


def _format_time_left(total_seconds: float | int) -> str:
    seconds_left = max(0, int(total_seconds))
    minutes, seconds = divmod(seconds_left, 60)
    return f"{minutes:02d}:{seconds:02d}"


def _get_remaining_seconds(match_state: MatchState) -> int:
    time_limit = int(match_state.get('time_limit') or DEFAULT_MATCH_TIME_LIMIT)
    started_at = match_state.get('started_at')
    if started_at is None:
        return time_limit
    elapsed = (timezone.now() - started_at).total_seconds()
    return max(0, int(time_limit - elapsed))


async def get_match_state(match_id: str) -> MatchState:
    state = ROOM_GAME_STATE_BY_MATCH.get(match_id)
    if state is None:
        print(f"Match state for match_id {match_id} not found, creating new one.")
        state = await _new_match_state(match_id)
        ROOM_GAME_STATE_BY_MATCH[match_id] = state
    return state


@database_sync_to_async
def _get_match_record(match_id):
    Match = apps.get_model('match', 'Match')
    match_record = Match.objects.filter(id=match_id).first()
    print(f"Fetched match record for match_id {match_id}: {match_record}")
    if match_record is None:
        return None
    return match_record


async def _new_match_state(match_id):
    match_record = await _get_match_record(match_id)
    time_limit = match_record.time_limit if match_record else DEFAULT_MATCH_TIME_LIMIT
    return {
        'match_id': match_id,
        'time': _format_time_left(time_limit),
        'status': match_record.status if match_record else 'waiting',
        'time_limit': time_limit,
        'max_players': match_record.players_maxcount if match_record else 1,
        'started_at': match_record.started_at if match_record else None,
        'online_players': 1,
        'live_players': 1,
        'players': {},
    }


async def broadcast_to_match(match_id: str, event_type: str, payload: dict | None = None):
    channel_layer = get_channel_layer()
    print(f"Broadcasting event '{event_type}' to match {match_id} with payload: {payload} and channel_layer: {channel_layer}")
    await channel_layer.group_send(
        f"game_{match_id}",
        {
            'type': event_type,
            'payload': payload,
        },
    )


@database_sync_to_async
def _save_match_start_db(match_id):
    Match = apps.get_model('match', 'Match')
    match_record = Match.objects.filter(id=match_id).first()
    if match_record:
        match_record.status = 'live'
        match_record.started_at = timezone.now()
        match_record.save(update_fields=['status', 'started_at'])

    return None


async def _save_match_start(match_id):
    await _save_match_start_db(match_id)
    print(f"Match LIVE {match_id}")

    match_state = ROOM_GAME_STATE_BY_MATCH.get(match_id)
    if match_state is None:
        return

    match_state['status'] = 'live'
    match_state['started_at'] = timezone.now()
    match_state['time'] = _format_time_left(match_state.get('time_limit', DEFAULT_MATCH_TIME_LIMIT))

    payload = []
    ind = 0
    for player_id, player_info in match_state['players'].items():
        payload.append({
            'user_id': player_id,
            'index': ind,
        })
        ind += 1
    print("Prepared start payload: ", payload)
    await broadcast_to_match(match_id, 'start', payload)


def calcWinner(match_state: MatchState) -> int:
    players = match_state.get('players', {})
    user_id = None
    for p in players.values() :
        if p.get('health', 0) > 0:
            if user_id is not None:
                user_id = p['user_id']
            else:
                user_id = None
                break

    if user_id is not None:
        return user_id

    max_score = -1
    for p in players.values() :
        if p.get('score') + p.get('health') > max_score:
            max_score = p.get('score') + p.get('health')
            user_id = p['user_id']

    return user_id


@database_sync_to_async
def _save_match_finish_db(match_id, winner_id):
    match_state = ROOM_GAME_STATE_BY_MATCH.get(match_id, {'players': {}})
    Match = apps.get_model('match', 'Match')
    match_record = Match.objects.filter(id=match_id).first()
    if match_record is None:
        return False

    if match_record.status == 'finished':
        return False

    match_record.status = 'finished'
    match_record.finished_at = timezone.now()
    match_record.save(update_fields=['status', 'finished_at'])
    print(f"Match FINISHED {match_id}")

    for player_id, player_info in match_state['players'].items():
        MatchPlayer = apps.get_model('match', 'MatchPlayer')
        player_record = MatchPlayer.objects.filter(match_id=match_id, user_id=player_id).first()
        if player_record:
            player_record.score = player_info.get('score', 0)
            player_record.result = 'win' if player_info.get('user_id') == winner_id else 'loss'
            player_record.save(update_fields=['score', 'result'])
            print(f"Updated player {player_id} record with score {player_record.score} and result {player_record.result}")

    return True


async def _save_match_finish(match_id):
    match_state = ROOM_GAME_STATE_BY_MATCH.get(match_id, {'players': {}})
    winner_id = calcWinner(match_state)
    was_saved = await _save_match_finish_db(match_id, winner_id)
    if not was_saved:
        return

    print(f"Match FINISHED {match_id}")

    payload = []
    for player_id, player_info in match_state['players'].items():
        payload.append({
            'user_id': player_id,
            'result': 'win' if player_info.get('user_id') == winner_id else 'loss',
        })
    print("Prepared finish payload: ", payload)
    await broadcast_to_match(match_id, 'room_state', match_state)
    await broadcast_to_match(match_id, 'stop', payload)

    ROOM_GAME_STATE_BY_MATCH.pop(match_id, None)


async def add_new_player(match_state, userInfo):
    print(f"Adding new player to match state: {userInfo['user_id']}")
    players = match_state.get('players', {})
    userInfo['health'] = 100
    userInfo['score'] = 0
    players[userInfo['user_id']] = userInfo
    match_state['online_players'] = players.__len__()
    match_state['live_players'] = players.__len__()
    print(f"match_state['online_players']: {match_state['online_players']} {match_state['status']}")

    if match_state['online_players'] >= match_state['max_players'] and match_state['status'] == 'waiting':
        print(f"Max players reached for match_id {match_state['match_id']}. Starting match.")
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

    match_state = await get_match_state(match_id)
    if match_state['status'] != 'live':
        return

    print(f"shot from user {user_id} with shot_id {shot_id} damage: {damage}, score: {score}")
    players = match_state.get('players', {})
    curUser = players.get(user_id)
    shotUser = players.get(shot_id)
    if curUser is not None and user_id != shot_id:
        curUser['score'] = curUser.get('score', 0) + score
        print(f"new score user {user_id}: {curUser['score']}")

    if shotUser is not None:
        shotUser['health'] = shotUser.get('health', 100) - damage
        print(f"new health user {shot_id}: {shotUser['health']}")
        if shotUser['health'] <= 0:
            shotUser['health'] = 0
            match_state['live_players'] = match_state.get('live_players', 1) - 1
            print(f"Live players updated: {match_state['live_players']}")
            if match_state['live_players'] <= 1:
                match_state['status'] = 'finished'
                print(f"Match state updated to FINISHED")
                await _save_match_finish(match_id)
