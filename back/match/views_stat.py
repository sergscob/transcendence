from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, F, Q, Sum, Window
from .models import MatchPlayer, MatchStatus, PlayerResult
from rest_framework.pagination import PageNumberPagination
from django.db.models.functions import DenseRank, Coalesce

class StatsPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = "page_size"
    max_page_size = 100


class StatsUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):

        finished_qs = MatchPlayer.objects.filter(
            user_id=user_id,
            match__status=MatchStatus.FINISHED,
        )

        total_matches = finished_qs.count()
        wins = finished_qs.filter(result=PlayerResult.WIN).count()
        losses = total_matches - wins
        score = finished_qs.aggregate(total_score=Sum("score"))["total_score"] or 0
        username = finished_qs.values_list("user__username", flat=True).first()

        leaderboard = (
            MatchPlayer.objects.filter(match__status=MatchStatus.FINISHED)
            .values("user_id")
            .annotate(
                total_matches=Count("id"),
                wins=Count("id", filter=Q(result=PlayerResult.WIN)),
                score=Sum("score")
            )
            .annotate(
                place=Window(
                    expression=DenseRank(),
                    order_by=[
                        F("wins").desc(),
                        F("score").desc(),
                        F("total_matches").desc(),
                        F("user_id").asc(),
                    ],
                )
            )
        )
        # print (leaderboard)
        place_row = (
            leaderboard
            .filter(user_id=user_id)
            .order_by("place", "user_id")
            .values("place")
            .first()
        )
        place = place_row["place"] if place_row else None
        
        return Response({
            "user_id": user_id,
            "username": username,
            "total_matches": total_matches,
            "wins": wins,
            "losses": losses,
            "score": score,
            "place": place,
        })

class StatsTotalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        finished_qs = MatchPlayer.objects.filter(match__status=MatchStatus.FINISHED)

        ordering = request.query_params.get("order", "place")
        ordering_map = {
            "username": "user__username",
            "total_matches": "total_matches",
            "wins": "wins",
            "losses": "losses",
            "score": "score",
            "place": "place",
        }
        ordering_desc = ordering.startswith("-")
        ordering_key = ordering[1:] if ordering_desc else ordering
        if ordering_key not in ordering_map:
            ordering = "place"
        else:
            ordering = f"-{ordering_map[ordering_key]}" if ordering_desc else ordering_map[ordering_key]

        per_user_stats = (
            finished_qs
            .values("user_id", "user__username")
            .annotate(
                total_matches=Count("id"),
                wins=Count("id", filter=Q(result=PlayerResult.WIN)),
                score=Sum("score"),
            )
            .annotate(losses=F("total_matches") - F("wins"))
            .annotate(
                place=Window(
                    expression=DenseRank(),
                    order_by=[
                        F("wins").desc(),
                        F("score").desc(),
                        F("total_matches").desc(),
                        F("user_id").asc(),  # стабильный tie-break
                    ],
                )
            )            
            .order_by(ordering)
        )

        paginator = StatsPagination()
        page = paginator.paginate_queryset(per_user_stats, request, view=self)

        data = [
            {
                "user_id": row["user_id"],
                "username": row["user__username"],
                "total_matches": row["total_matches"],
                "wins": row["wins"],
                "losses": row["losses"],
                "score": row["score"] or 0,
                "place": row["place"],
            }
            for row in page
        ]

        return paginator.get_paginated_response(data)