from django.urls import path, include
from .views import FriendView
from .views_search import FriendSearchView

urlpatterns = [
    path('api/friends/search/', FriendSearchView.as_view()),
    path('api/friends/', FriendView.as_view()),  # GET, POST 
    path('api/friends/<int:friend_id>/', FriendView.as_view()),  #PATCH, DELETE
]