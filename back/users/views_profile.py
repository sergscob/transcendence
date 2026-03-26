
# Старый вариант через UpdateAPIView:
# from rest_framework import generics, permissions
# from .serializers import UserSerializer
# class ProfileUpdateView(generics.UpdateAPIView):
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     def get_object(self):
#         return self.request.user

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, parsers
from .serializers import UserSerializer

class ProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"detail": "User deleted"}, status=status.HTTP_204_NO_CONTENT)
