from django.db import transaction
from django.utils import timezone
from .models import Match, MatchPlayer, MatchStatus


@transaction.atomic
def match_create_and_join(creator, mode="duel", map_name="default", score_limit=5, time_limit_sec=300):
    match = Match.objects.create(
        created_by=creator,
        mode=mode,
        map_name=map_name,
        score_limit=score_limit,
        time_limit_sec=time_limit_sec,
        status=MatchStatus.WAITING,
    )
    MatchPlayer.objects.create(match=match, user=creator, is_ready=True)
    return match

def get_count_players(match, player):
    return MatchPlayer.objects.filter(match=match, user=player).count() 


@transaction.atomic
def match_join(match, player):
    if match.status != MatchStatus.WAITING:
        raise ValueError("Cannot join a match that is not waiting for players.")
    if MatchPlayer.objects.filter(match=match, user=player).exists():
        raise ValueError("Player has already joined this match.")
    if match.mode == "duel" and match.players.count() >= 2:
        raise ValueError("Duel mode matches can only have 2 players.")

    MatchPlayer.objects.create(match=match, user=player)

@transaction.atomic
def set_ready(match, user, ready=True):
    p = MatchParticipant.objects.select_for_update().get(match=match, user=user)
    p.is_ready = ready
    p.save(update_fields=["is_ready"])

    participants = MatchParticipant.objects.select_for_update().filter(match=match)
    if participants.exists() and all(x.is_ready for x in participants) and match.status == MatchStatus.WAITING:
        match.status = MatchStatus.LIVE
        match.started_at = timezone.now()
        match.save(update_fields=["status", "started_at"])

    return p