from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, parsers
from .serializers import FriendSerializer
from django.contrib.auth import get_user_model
from users.models import User
from .models import Friend
from django.db import models
from django.utils import timezone
from datetime import date, timedelta
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from users.mixins import UpdateLastSeenMixin




class FriendView(UpdateLastSeenMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.FormParser, parsers.JSONParser]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('waiting', openapi.IN_QUERY, description="waiting for approval", type=openapi.TYPE_INTEGER)
        ]
    )
    def get(self, request):
        waiting = request.query_params.get('waiting', None)
        user = request.user
        data = []
        if waiting is not None:
            friends = Friend.objects.filter(friend=user, accepted=False).select_related('user')
            for f in friends:
                friend = f.user
                friend_info = {
                    'id': friend.id,
                    'username': friend.username,
                    'email': friend.email,
                    'avatar': friend.avatar.url if getattr(friend, 'avatar', None) and getattr(friend.avatar, 'url', None) else None,
                    'accepted': f.accepted
                }
                data.append(friend_info)

        else:
            friends = Friend.objects.filter(user=user, accepted=True).select_related('friend')
            for f in friends:
                friend = f.friend
                print(friend.username, friend.last_seen, timezone.now() , timezone.now() - timedelta(minutes=15))
                friend_info = {
                    'id': friend.id,
                    'username': friend.username,
                    'email': friend.email,
                    'avatar': friend.avatar.url if getattr(friend, 'avatar', None) and getattr(friend.avatar, 'url', None) else None,
                    'accepted': f.accepted,
                    'online': friend.last_seen and (friend.last_seen > timezone.now() - timedelta(minutes=15))
                }
                data.append(friend_info)
        return Response(data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['friend_id'],
            properties={
                'friend_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID пользователя для добавления в друзья')
            }
        )
    )
    def post(self, request):
        friend_id = request.data.get('friend_id', None)
        user = request.user
        if not friend_id:
            return Response({'error': 'friend_id in URL is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            friend = User.objects.get(id=friend_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        if Friend.objects.filter(user=user, friend=friend).exists():
            return Response({'error': 'Friend request already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # if there is a reverse request, accept it 
        reverse_request = Friend.objects.filter(user=friend, friend=user, accepted=False).first()
        if reverse_request:
            reverse_request.accepted = True
            reverse_request.save()
            # second record 
            Friend.objects.create(user=user, friend=friend, accepted=True)
            return Response({'success': 'Friendship accepted'}, status=status.HTTP_201_CREATED)
             
        # create new request
        friend_request = Friend.objects.create(
            user=user,
            friend=friend,
            accepted=False
        )
        return Response({'success': 'Friend request sent', 'id': friend_request.id}, status=status.HTTP_201_CREATED)

    def patch(self, request, friend_id=None):
        user = request.user
        accepted = request.data.get('accepted')
        if friend_id is None or accepted is None:
            return Response({'error': 'friend_id (in URL) and accepted are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            friend = User.objects.get(id=friend_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            rec = Friend.objects.get(user=friend, friend=user)
        except Friend.DoesNotExist:
            return Response({'error': 'Friendship not found'}, status=status.HTTP_404_NOT_FOUND)

        if str(accepted).lower() in ['true', '1', 'yes']:
            rec.accepted = True
            rec.save()
            if not Friend.objects.filter(user=user, friend=friend).exists():
                Friend.objects.create(user=user, friend=friend, accepted=True)
            return Response({'success': 'Friendship accepted and mirrored'}, status=status.HTTP_200_OK)
        else:
            return Response({'info': 'No changes made, friendship not accepted'}, status=status.HTTP_200_OK)

    def delete(self, request, friend_id=None):
        user = request.user
        if friend_id is None:
            return Response({'error': 'friend_id is required in URL'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            friend = User.objects.get(id=friend_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        deleted_count, _ = Friend.objects.filter(
            (models.Q(user=user, friend=friend) | models.Q(user=friend, friend=user))
        ).delete()
        if deleted_count == 0:
            return Response({'error': 'No friendship found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': 'Friendship deleted'}, status=status.HTTP_200_OK)
