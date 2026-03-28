from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, parsers
from .serializers import FriendSerializer
from django.contrib.auth import get_user_model
from users.models import User
from .models import Friend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class FriendSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.FormParser, parsers.JSONParser]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('name', openapi.IN_QUERY, description="Search by username", type=openapi.TYPE_STRING)
        ]
    )
    def get(self, request):
        user = request.user
        name_query = request.query_params.get('name', '')
        print(name_query)

        friends_ids = Friend.objects.filter(user=user, accepted=True).values_list('friend_id', flat=True)
        users = User.objects.exclude(pk=user.pk).exclude(pk__in=friends_ids)
        users = users.filter(username__icontains=name_query)
        data = []
        for u in users:
            user_info = {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'avatar': u.avatar.url if getattr(u, 'avatar', None) and getattr(u.avatar, 'url', None) else None,
                'accepted': Friend.objects.filter(user=user, friend=u, accepted=True).exists(),
                'invitation_sent': Friend.objects.filter(user=user, friend=u, accepted=False).exists()
            }
            data.append(user_info)
        return Response(data, status=status.HTTP_200_OK)