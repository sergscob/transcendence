from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.exceptions import NotFound
from django.db.models import Count, F
from .models import Match, MatchStatus
from . import services


class MatchListViewAvailable(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = (
            Match.objects.filter(status=MatchStatus.WAITING)
            .annotate(num_players=Count("players"))
            .filter(num_players__lt=F("players_maxcount"))
            .exclude(players__user=request.user)
            .distinct()
        )
        return Response([{"id": str(m.id), "status": m.status} for m in qs])


class MatchListViewMy(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        match = services.match_create_and_join(request.user, **request.data)
        return Response({"id": str(match.id)}, status=status.HTTP_201_CREATED)

    def get(self, request):
        qs = Match.objects.filter(players__user=request.user).distinct()
        return Response([{"id": str(match.id), "status": match.status} for match in qs])



class MatchActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_match(self, match_id):
        try:
            return Match.objects.get(id=match_id)
        except Match.DoesNotExist as exc:
            raise NotFound("Match not found") from exc

    def get(self, request, match_id):
        match = self._get_match(match_id)
        return Response({"id": str(match.id), "status": match.status})

    def post(self, request, match_id):
        match = self._get_match(match_id)
        path = request.path
        if path.endswith("/join/"):
            services.match_join(match, request.user)
        elif path.endswith("/ready/"):
            services.set_ready(match, request.user, True)
        elif path.endswith("/finish/"):
            # services.finish_match(...) если есть
            pass
        return Response({"ok": True})