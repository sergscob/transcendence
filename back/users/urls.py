from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from .views_google import google_login, google_callback
from .views_e42 import e42_login, e42_callback
from .views import RegisterView, ProfileView
from .views_profile import ProfileUpdateView

urlpatterns = [
    path('api/auth/register/', RegisterView.as_view()),
    path('api/auth/login/', TokenObtainPairView.as_view()),

    path("api/auth/google/", google_login),
    path("api/auth/google/callback/", google_callback),
    path("api/auth/e42/", e42_login),
    path("api/auth/e42callback/", e42_callback),

    path('api/profile/', ProfileView.as_view()),
    path('api/profile/update/', ProfileUpdateView.as_view()),
    
]