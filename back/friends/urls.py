from django.urls import path, include
from .views import FriendSearchView
urlpatterns = [
    path('api/friends/search/', FriendSearchView.as_view()),

]