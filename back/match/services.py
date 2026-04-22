from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import ValidationError
from .models import Match, MatchPlayer, MatchStatus

MIN_PLAYERS = 2
MAX_PLAYERS = 10
MIN_TIME_LIMIT = 120
MAX_TIME_LIMIT = 3600

def is_participant_of_open_match(user):
    return MatchPlayer.objects.filter(user=user, match__status=MatchStatus.WAITING).exists()


def get_count_players(match, player):
    return MatchPlayer.objects.filter(match=match, user=player).count() 


@transaction.atomic
def match_create_and_join(creator, players_maxcount=2, map_name="default", score_limit=5, time_limit=120):

    try:
        players_maxcount = int(players_maxcount)
    except (TypeError, ValueError) as exc:
        raise ValidationError({"detail": _("Players count must be a number.")}) from exc

    if players_maxcount < MIN_PLAYERS or players_maxcount > MAX_PLAYERS:
        raise ValidationError({"detail": _("Players count must be between 2 and 10.")})

    try:
        time_limit = int(time_limit)
    except (TypeError, ValueError) as exc:
        raise ValidationError({"detail": _("Time limit must be a number.")}) from exc

    if time_limit < MIN_TIME_LIMIT or time_limit > MAX_TIME_LIMIT:
        raise ValidationError({"detail": _("Time limit must be between 120 and 3600 seconds.")})

    if is_participant_of_open_match(creator):
        raise ValidationError({"detail": _("You are already a participant in another match.")})

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
        raise ValidationError({"detail": _("Cannot join a match that is not waiting for players.")})
    if MatchPlayer.objects.filter(match=match, user=player).exists():
        raise ValidationError({"detail": _("Player has already joined this match.")})
    if match.players.count() >= match.players_maxcount:
        raise ValidationError({"detail": _("Match is already full.")})
    if is_participant_of_open_match(player):
        raise ValidationError({"detail": _("You are already a participant in another match.")})

    MatchPlayer.objects.create(match=match, user=player, is_ready=True, is_joined=True)


@transaction.atomic
def set_ready(match, user, ready=True):
    try:
        p = MatchPlayer.objects.select_for_update().get(match=match, user=user)
    except MatchPlayer.DoesNotExist as exc:
        raise ValidationError({"detail": _("Player is not a participant of this match.")}) from exc

    p.is_ready = ready
    p.save(update_fields=["is_ready"])

    players = MatchPlayer.objects.select_for_update().filter(match=match)
    if players.exists() and all(x.is_ready for x in players) and match.status == MatchStatus.WAITING:
        match.status = MatchStatus.LIVE
        match.started_at = timezone.now()
        match.save(update_fields=["status", "started_at"])

    return p