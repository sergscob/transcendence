from typing import Any

from channels.db import database_sync_to_async
from django.apps import apps
from django.db.models import Count, Q, Sum

from match.levels import get_level


def _get_player_achievements_sync(match_id: str, player_id: int, current_score: int, is_winner: bool) -> list[dict[str, Any]]:
    MatchPlayer = apps.get_model('match', 'MatchPlayer')
    previous_stats = MatchPlayer.objects.filter(
        user_id=player_id,
        match__status='finished',
    ).exclude(
        match_id=match_id,
    ).aggregate(
        total_score=Sum('score'),
        wins=Count('id', filter=Q(result='win')),
    )

    previous_score = previous_stats.get('total_score') or 0
    total_score = previous_score + max(0, current_score or 0)

    achievements = []

    previous_level = get_level(previous_score)
    current_level = get_level(total_score)
    if current_level < previous_level:
        achievements.append({
                'code': 'level_up',
                'level': current_level,
        })

    if is_winner and (previous_stats.get('wins') or 0) == 0:
        achievements.append({
                'code': 'first_win',
        })

    return achievements


@database_sync_to_async
def get_player_achievements(match_id: str, player_id: int, current_score: int, is_winner: bool) -> list[dict[str, Any]]:
    return _get_player_achievements_sync(match_id, player_id, current_score, is_winner)