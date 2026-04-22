from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .levels import get_level, get_score_for_level

class MilestonesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        milestones = [
            {
                "level": level, 
                "score": get_score_for_level(level)
            }
            for level in range(1, 11)
        ]
        return Response(milestones)


    