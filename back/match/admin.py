from django.contrib import admin

# Register your models here.
from .models import Achievement, MatchPlayer, Match, MatchStatus, PlayerResult

admin.site.register(MatchPlayer)
admin.site.register(Match)
admin.site.register(Achievement)


