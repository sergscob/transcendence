from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Achievement
from .serializers import AchievementSerializer

class AchievementListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        qs = Achievement.objects.filter(user_id=user_id).order_by("-created_at")
        serializer = AchievementSerializer(qs, many=True)
        return Response(serializer.data)
