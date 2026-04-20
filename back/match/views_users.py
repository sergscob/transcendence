from rest_framework.views import APIView
from rest_framework import permissions
from django.db.models import Count, F, Q, Exists, OuterRef, Subquery, Max
from django.db.models.functions import Coalesce
from .models import Match, MatchPlayer
from .serializers import MatchUsersSerializer
from .views_stat import StatsPagination


class MatchUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        ordering = request.query_params.get("order", "-created_at")
        ordering_map = {
            "created_at": "created_at",
            "finished_at": "finished_at",
            "status": "status",
            "map_name": "map_name",
            "score_limit": "score_limit",
            "time_limit": "time_limit",
            "created_by_name": "created_by_name",
            "num_players": "num_players",
            "ready_players": "ready_players",
            "user_result": "user_result",
            "user_score": "user_score",
        }
        ordering_desc = ordering.startswith("-")
        ordering_key = ordering[1:] if ordering_desc else ordering
        if ordering_key not in ordering_map:
            ordering = "-created_at"
        else:
            ordering = f"-{ordering_map[ordering_key]}" if ordering_desc else ordering_map[ordering_key]

        qs = (
            Match.objects.filter(
                Exists(MatchPlayer.objects.filter(match_id=OuterRef("pk"), user_id=user_id))
            )
            .annotate(
                num_players=Count("players", distinct=True),
                ready_players=Count("players", filter=Q(players__is_ready=True), distinct=True),
                created_by_name=F("created_by__username"),
                user_result=Subquery(
                    MatchPlayer.objects.filter(match_id=OuterRef("pk"), user_id=user_id).values("result")[:1]
                ),
                user_score=Coalesce(Max("players__score", filter=Q(players__user_id=user_id)), 0),
            )
            .prefetch_related("players__user")
            .distinct()
            .order_by(ordering)
        )
        paginator = StatsPagination()
        page = paginator.paginate_queryset(qs, request, view=self)

        serializer = MatchUsersSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
