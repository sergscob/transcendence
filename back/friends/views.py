from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, parsers
from .serializers import FriendSerializer
from django.contrib.auth import get_user_model
from users.models import User
from .models import Friend

class FriendSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.FormParser, parsers.JSONParser]
    
    def get(self, request):
        user = request.user
        name_query = request.query_params.get('name', '')
        print(name_query)

        friends_ids = Friend.objects.filter(user=user, accepted=True).values_list('friend_id', flat=True)
        users = User.objects.exclude(pk=user.pk).exclude(pk__in=friends_ids).filter(username__icontains=name_query)
        data = []
        for u in users:
            user_info = {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'avatar': u.avatar.url if getattr(u, 'avatar', None) and getattr(u.avatar, 'url', None) else None
            }
            friend_rel = Friend.objects.filter(user=user, friend=u).first()
            if friend_rel:
                friend_info = {
                    'wait_accept': friend_rel.wait_accept,
                    'want_to_be_friend': friend_rel.want_to_be_friend,
                    'accepted': friend_rel.accepted
                }
            else:
                friend_info = {
                    'wait_accept': None,
                    'want_to_be_friend': None,
                    'accepted': None
                }
            data.append({**user_info, **friend_info})
        return Response(data, status=status.HTTP_200_OK)