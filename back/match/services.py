from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .models import Match, MatchPlayer, MatchStatus

def is_participant_of_open_match(user):
    return MatchPlayer.objects.filter(user=user, match__status=MatchStatus.WAITING).exists()


def get_count_players(match, player):
    return MatchPlayer.objects.filter(match=match, user=player).count() 


@transaction.atomic
def match_create_and_join(creator, players_maxcount=2, map_name="default", score_limit=5, time_limit=120):

    if is_participant_of_open_match(creator):
        raise ValueError(_("You are already a participant in another match."))

    match = Match.objects.create(
        created_by=creator,
        status=MatchStatus.WAITING,
        map_name=map_name,
        score_limit=score_limit,
        time_limit=time_limit,
        players_maxcount=players_maxcount,
    )
    MatchPlayer.objects.create(match=match, user=creator, is_ready=True, is_joined=True)
    return match



@transaction.atomic
def match_join(match, player):
    if match.status != MatchStatus.WAITING:
        raise ValueError(_("Cannot join a match that is not waiting for players."))
    if MatchPlayer.objects.filter(match=match, user=player).exists():
        raise ValueError(_("Player has already joined this match."))
    if match.players.count() >= match.players_maxcount:
        raise ValueError(_("Match is already full."))
    if is_participant_of_open_match(player):
        raise ValueError(_("You are already a participant in another match."))

    MatchPlayer.objects.create(match=match, user=player)


@transaction.atomic
def set_ready(match, user, ready=True):
    p = MatchPlayer.objects.select_for_update().get(match=match, user=user)
    p.is_ready = ready
    p.save(update_fields=["is_ready"])

    participants = MatchPlayer.objects.select_for_update().filter(match=match)
    if participants.exists() and all(x.is_ready for x in participants) and match.status == MatchStatus.WAITING:
        match.status = MatchStatus.LIVE
        match.started_at = timezone.now()
        match.save(update_fields=["status", "started_at"])

    return p