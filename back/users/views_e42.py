from django.conf import settings
from django.shortcuts import redirect
import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

def e42_login(request):
    url = (
        "https://api.intra.42.fr/oauth/authorize"
        f"?client_id={settings.E42_CLIENT_ID}"
        f"&redirect_uri={settings.E42_REDIRECT_URI}"
        "&response_type=code"
    )
    return redirect(url)


User = get_user_model()

def e42_callback(request):
    code = request.GET.get("code")

    token_res = requests.post(
        "https://api.intra.42.fr/oauth/token",
        data={
            "grant_type": "authorization_code",
            "client_id": settings.E42_CLIENT_ID,
            "client_secret": settings.E42_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.E42_REDIRECT_URI,
        },
    )

    if (token_res.status_code != 200): print("E42 RESPONSE:", token_res.text)
    token_res = token_res.json()    

    access_token = token_res.get("access_token")

    user_info = requests.get(
        "https://api.intra.42.fr/v2/me",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    if (user_info is None): print("Me is none")

    username = f"{user_info.get('usual_full_name')} (42 login: {user_info.get('login')}"
    email = user_info.get("email")
    # 'email': 'sskobyak@student.42.fr', 'login': 'sskobyak', 'first_name': 'Sergey', 'last_name': 'Skobyakov', 'usual_full_name': 'Sergey Skobyakov'

    user, _ = User.objects.get_or_create(
         email=email,
         defaults={"username": username}
    )

    refresh = RefreshToken.for_user(user)

    return redirect(f"{settings.FRONTEND_URL}/oauth?token={refresh.access_token}")
