from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken
import pyotp
import qrcode
from io import BytesIO
import base64

def verify_2fa(user, code):
    # print("verify_2fa", user.two_factor_secret)
    totp = pyotp.TOTP(user.two_factor_secret)
    return totp.verify(code)


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
    user = request.user
    secret = pyotp.random_base32()
    # print ("save generated secret", secret)
    user.two_factor_secret = secret
    user.save()

    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(
        name=user.username,
        issuer_name="Transcendence"   
    )
    qr = qrcode.make(uri)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")

    return Response({"qr": base64.b64encode(buffer.getvalue()).decode()})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_2fa(request):
    code = request.data.get("code")
    # print ("Received code in confirm_2fa", code)
    if verify_2fa(request.user, code):
        request.user.is_2fa_enabled = True
        request.user.save()
        return Response({"status": "2FA enabled"})
    
    return Response({"error": str(_("Invalid code"))}, status=400)    


@api_view(['POST'])
def verify_otp(request):
    from .models import User

    user_id = request.data.get("user_id")
    code = request.data.get("code")

    user = User.objects.get(id=user_id)

    if verify_2fa(user, code):
        tokens = get_tokens(user)
        return Response({
            "access": tokens["access"],
            "refresh": tokens["refresh"]
        })
    return Response({"error": str(_("Invalid code"))}, status=400)


@api_view(['POST'])
def login_view(request):
    error = {}
    username = request.data.get("username")
    if not username:
        error["username"] = str(_("This field is required."))
    password = request.data.get("password")
    if not password:
        error["password"] = str(_("This field is required."))
    if error:
        return Response(error, status=200)    

    user = authenticate(username=username, password=password)

    if not user:
        return Response({"detail": str(_("Password or username is incorrect"))}, status=200)

    if user.is_2fa_enabled:
        return Response({
            "requires_2fa": True,
            "user_id": user.id
        })

    tokens = get_tokens(user)
    return Response({
        "access": tokens["access"],
        "refresh": tokens["refresh"]
    })