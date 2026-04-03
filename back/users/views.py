
from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import User
from .serializers import RegisterSerializer, UserSerializer
from .mixins import UpdateLastSeenMixin


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer



class ProfileView(UpdateLastSeenMixin, generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get(self, request, id=None):
        if id and request.user.id != id:
            user = User.objects.filter(id=id).first()
        else:
            user = request.user

        if not user:
            return Response({"detail": "User not found"}, status=404)

        serializer = UserSerializer(user)
        return Response(serializer.data)