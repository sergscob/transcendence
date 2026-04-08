# POST /api/matches/ create.
# POST /api/matches/{id}/join.
# POST /api/matches/{id}/ready.
# POST /api/matches/{id}/finish.
# GET /api/matches/{id}. 
# GET /api/matches/my.

from django.urls import path, include
from .views import MatchListViewMy, MatchListViewAvailable, MatchActionView

    
urlpatterns = [
    path("api/matches/", MatchListViewMy.as_view()),                 # POST create, GET my

    path("api/matches/available/", MatchListViewAvailable.as_view()),   # GET available matches
    
    path("api/matches/<uuid:match_id>/", MatchActionView.as_view()),     # GET detail
    path("api/matches/<uuid:match_id>/join/", MatchActionView.as_view()),
    path("api/matches/<uuid:match_id>/ready/", MatchActionView.as_view()),
    path("api/matches/<uuid:match_id>/finish/", MatchActionView.as_view()),
]