from django.conf import settings
from django.shortcuts import redirect
import requests
from urllib.parse import urlencode, urlparse
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken


def _is_valid_http_url(value):
    if not value:
        return False
    parsed = urlparse(value)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def _callback_url(request):
    configured = (getattr(settings, "E42_REDIRECT_URI", "") or "").strip()
    # if configured and "localhost" not in configured and "127.0.0.1" not in configured:
    return configured
    # return request.build_absolute_uri("/api/auth/e42callback/")


def _frontend_base_url(state_value):
    if _is_valid_http_url(state_value):
        return state_value.rstrip("/")
    return settings.FRONTEND_URL.rstrip("/")

def e42_login(request):
    params = {
        "client_id": settings.E42_CLIENT_ID,
        "redirect_uri": _callback_url(request),
        "response_type": "code",
    }

    next_url = request.GET.get("next", "").strip()
    if _is_valid_http_url(next_url):
        params["state"] = next_url

    url = "https://api.intra.42.fr/oauth/authorize?" + urlencode(params)
    return redirect(url)


User = get_user_model()

def e42_callback(request):
    code = request.GET.get("code")
    state_value = request.GET.get("state", "").strip()
    redirect_uri = _callback_url(request)

    token_res = requests.post(
        "https://api.intra.42.fr/oauth/token",
        data={
            "grant_type": "authorization_code",
            "client_id": settings.E42_CLIENT_ID,
            "client_secret": settings.E42_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri,
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

    frontend_base_url = _frontend_base_url(state_value)
    return redirect(f"{frontend_base_url}/oauth?token={refresh.access_token}")
