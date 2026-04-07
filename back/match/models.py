import uuid
from django.conf import settings
from django.db import models

# Create your models here.

class MatchStatus(models.TextChoices):
    WAITING = "waiting"
    LIVE = "live"
    FINISHED = "finished"
    CANCELED = "canceled"


class MatchMode(models.TextChoices):
    DUEL = "duel"
    TOURNAMENT = "tournament"


class ParticipantResult(models.TextChoices):
    NONE = "none"
    WIN = "win"
    LOSS = "loss"


class Match(models.Model):
    def __str__(self):
        return f"{self.created_by.username} - {self.status}. Created {self.created_at}"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_matches', on_delete=models.SET_NULL, null=True, blank=True)
    mode = models.CharField(max_length=20, choices=MatchMode.choices, default=MatchMode.DUEL)
    status = models.CharField(max_length=20, choices=MatchStatus.choices, default=MatchStatus.WAITING)
    
    map_name = models.CharField(max_length=64, default="default")
    score_limit = models.PositiveIntegerField(default=5)
    time_limit = models.PositiveIntegerField(default=120)

    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
        ]


class MatchPlayer(models.Model):
    match = models.ForeignKey(Match, related_name='players', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    result = models.CharField(max_length=20, choices=ParticipantResult.choices, default=ParticipantResult.NONE)
    is_ready = models.BooleanField(default=False)
    is_joined = models.BooleanField(default=False)
    health = models.IntegerField(default=100)
    score = models.IntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["match", "user"], name="uniq_user_per_match"),
        ]
        indexes = [
            models.Index(fields=["match"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"{self.match_id} | {self.user.username}"