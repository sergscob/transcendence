from django.conf import settings
from django.shortcuts import redirect
from django.utils.translation import gettext_lazy as _
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
    configured = (getattr(settings, "GOOGLE_REDIRECT_URI", "") or "").strip()
    # if configured and "localhost" not in configured and "127.0.0.1" not in configured:
    return configured
    # return request.build_absolute_uri("/api/auth/google/callback/")


def _frontend_base_url(state_value):
    if _is_valid_http_url(state_value):
        return state_value.rstrip("/")
    return settings.FRONTEND_URL.rstrip("/")


def google_login(request):
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": _callback_url(request),
        "response_type": "code",
        "scope": "openid email profile",
    }

    next_url = request.GET.get("next", "").strip()
    if _is_valid_http_url(next_url):
        params["state"] = next_url

    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return redirect(url)


User = get_user_model()

def google_callback(request):
    state_value = request.GET.get("state", "").strip()
    frontend_base_url = _frontend_base_url(state_value)

    oauth_error = request.GET.get("error")
    if oauth_error:
        return redirect(f"{frontend_base_url}/oauth?error=google_{oauth_error}")

    code = request.GET.get("code")
    if not code:
        return redirect(f"{frontend_base_url}/oauth?error=missing_code")

    redirect_uri = _callback_url(request)
    token_res = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
    ).json()

    access_token = token_res.get("access_token")
    if not access_token:
        return redirect(f"{frontend_base_url}/oauth?error=token_exchange_failed")

    user_info = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    email = user_info.get("email")
    if not email:
        return redirect(f"{frontend_base_url}/oauth?error=missing_email")

    username = user_info.get("name") or email.split("@")[0]

    user, _ = User.objects.get_or_create(
        email=email,
        defaults={"username": username}
    )

    refresh = RefreshToken.for_user(user)

    return redirect(f"{frontend_base_url}/oauth?token={refresh.access_token}&refresh={refresh}")
