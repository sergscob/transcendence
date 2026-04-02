from django.urls import path, include
# from rest_framework_simplejwt.views import TokenObtainPairView
from .views_google import google_login, google_callback
from .views_e42 import e42_login, e42_callback
from .views import RegisterView, ProfileView
from .views_profile import ProfileUpdateView
from .views_2fa import enable_2fa, confirm_2fa, login_view, verify_otp

urlpatterns = [
    path('api/auth/register/', RegisterView.as_view()),
    # path('api/auth/login/', TokenObtainPairView.as_view()),

    path("api/auth/google/", google_login),
    path("api/auth/google/callback/", google_callback),
    path("api/auth/e42/", e42_login),
    path("api/auth/e42callback/", e42_callback),

    path('api/profile/', ProfileView.as_view()),
    path('api/profile/update/', ProfileUpdateView.as_view()),
    
    path('api/auth/login/', login_view),
    path('api/auth/verify-otp/', verify_otp),
    path('api/auth/enable-2fa/', enable_2fa),
    path('api/auth/confirm-2fa/', confirm_2fa),    
]