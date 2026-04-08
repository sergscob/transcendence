
from rest_framework import serializers
from .models import Match


class MatchSerializer(serializers.ModelSerializer):
    num_players = serializers.IntegerField(read_only=True)
    ready_players = serializers.IntegerField(read_only=True)
    created_by_name = serializers.CharField(read_only=True)

    class Meta:
        model = Match
        fields = "__all__"