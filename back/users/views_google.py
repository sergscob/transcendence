from django.conf import settings
from django.shortcuts import redirect
import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

def google_login(request):
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid email profile"
    )
    return redirect(url)


User = get_user_model()

def google_callback(request):
    code = request.GET.get("code")

    token_res = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
    ).json()

    access_token = token_res.get("access_token")

    user_info = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    email = user_info.get("email")
    username = user_info.get("name")

    user, _ = User.objects.get_or_create(
        email=email,
        defaults={"username": username}
    )

    refresh = RefreshToken.for_user(user)

    return redirect(f"http://localhost:5173/oauth?token={refresh.access_token}")
