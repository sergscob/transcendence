
from rest_framework import serializers
from .models import Match, MatchPlayer


class MatchSerializer(serializers.ModelSerializer):
    num_players = serializers.SerializerMethodField()
    ready_players = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    user_result = serializers.SerializerMethodField()
    user_score = serializers.SerializerMethodField()

    def get_num_players(self, obj):
        return getattr(obj, "num_players", None)

    def get_ready_players(self, obj):
        return getattr(obj, "ready_players", None)

    def get_created_by_name(self, obj):
        created_by_name = getattr(obj, "created_by_name", None)
        if created_by_name is not None:
            return created_by_name
        if obj.created_by_id and obj.created_by:
            return obj.created_by.username
        return None

    def get_user_result(self, obj):
        return getattr(obj, "user_result", None)

    def get_user_score(self, obj):
        return getattr(obj, "user_score", None)

    class Meta:
        model = Match
        fields = [
            "id",
            "created_by",
            "status",
            "players_maxcount",
            "created_at",
            "started_at",
            "finished_at",
            "num_players",
            "ready_players",
            "created_by_name",
            "user_result",
            "user_score",
        ]


class MatchPlayerInlineSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = MatchPlayer
        fields = [
            "user",
            "username",
            "result",
            "score",
        ]


class MatchUsersSerializer(MatchSerializer):
    players = MatchPlayerInlineSerializer(many=True, read_only=True)

    class Meta(MatchSerializer.Meta):
        fields = MatchSerializer.Meta.fields + ["players"]