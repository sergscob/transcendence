import secrets
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import User


def create_reset_token(user):
    token = secrets.token_urlsafe(32)

    user.reset_token = token
    user.reset_token_created_at = timezone.now()
    user.save()

    return token


@api_view(['POST'])
def request_password_reset(request):
    email = request.data.get("email")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "If email exists, reset link sent"})

    token = create_reset_token(user)
    link = f"{settings.BACKEND_URL}/reset-password/{token}/"
    try:
        send_mail(
            "Password Reset",
            f"Click link to reset password: {link}",
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
    except Exception as e:
        print("Error sending email:", e)
        #return Response({"error": "Failed to send email"}, status=500)

    return Response({"message": "If email exists, reset link sent"})    


@api_view(['POST'])
def reset_password(request):
    token = request.data.get("token")
    new_password = request.data.get("password")

    try:
        user = User.objects.get(reset_token=token)
    except User.DoesNotExist:
        return Response({"error": "Invalid token"}, status=400)

    if timezone.now() - user.reset_token_created_at > timedelta(minutes=60):
        return Response({"error": "Token expired"}, status=400)

    user.set_password(new_password)
    user.is_2fa_enabled = False
    user.two_factor_secret = None
    user.reset_token = None
    user.save()

    return Response({"message": "Password reset successful"})    