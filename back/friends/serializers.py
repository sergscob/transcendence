from rest_framework import serializers
from .models import Friend
from users.models import User

class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class FriendSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)
    # friend = UserShortSerializer(read_only=True)

    class Meta:
        model = Friend
        fields = ('id', 'username', 'email', 'avatar', 'accepted')