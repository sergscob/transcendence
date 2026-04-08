from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.exceptions import NotFound
from django.db.models import Count, F, Q
from django.utils.translation import gettext_lazy as _
from .models import Match, MatchPlayer, MatchStatus
from . import services
from .serializers import MatchSerializer


class MatchListViewAvailable(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = (
            Match.objects.filter(status=MatchStatus.WAITING)
            .annotate(
                num_players=Count("players", distinct=True),
                ready_players=Count("players", filter=Q(players__is_ready=True), distinct=True),
            )
            .filter(num_players__lt=F("players_maxcount"))
            .exclude(players__user=request.user)
            .distinct()
        )
        serializer = MatchSerializer(qs, many=True)
        return Response(serializer.data)


class MatchListViewMy(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        match = services.match_create_and_join(request.user, **request.data)
        return Response({"id": str(match.id)}, status=status.HTTP_201_CREATED)

    def get(self, request):
        qs = (
            Match.objects.filter(players__user=request.user)
            .annotate(
                num_players=Count("players", distinct=True),
                ready_players=Count("players", filter=Q(players__is_ready=True), distinct=True),
            )
            .distinct()
        )
        serializer = MatchSerializer(qs, many=True)
        return Response(serializer.data)


class MatchActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_match(self, match_id):
        try:
            return Match.objects.annotate(
                num_players=Count("players", distinct=True),
                ready_players=Count("players", filter=Q(players__is_ready=True), distinct=True),
            ).get(id=match_id)
        except Match.DoesNotExist as exc:
            raise NotFound(_("Match not found")) from exc

    def get(self, request, match_id):
        match = self._get_match(match_id)
        serializer = MatchSerializer(match)
        return Response(serializer.data)

    def post(self, request, match_id):
        match = self._get_match(match_id)
        path = request.path
        if path.endswith("/join/"):
            services.match_join(match, request.user)
        elif path.endswith("/ready/"):
            services.set_ready(match, request.user, True)
        elif path.endswith("/finish/"):
            print("finish match")
        return Response({"ok": True})

    def delete(self, request, match_id):
        match = self._get_match(match_id)
        user = request.user

        if match.status != MatchStatus.WAITING:
            return Response(
                {"detail": _("Only waiting matches can be canceled or left.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_creator = match.created_by_id == user.id
        is_participant = MatchPlayer.objects.filter(match=match, user=user).exists()

        if not is_creator and not is_participant:
            return Response(
                {"detail": _("You are not a participant of this match.")},
                status=status.HTTP_403_FORBIDDEN,
            )

        if is_creator:
            match.delete()
            return Response({"detail": _("Match deleted.")}, status=status.HTTP_200_OK)

        MatchPlayer.objects.filter(match=match, user=user).delete()
        return Response({"detail": _("You left the match.")}, status=status.HTTP_200_OK)