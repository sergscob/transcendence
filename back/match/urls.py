# POST /api/matches/ create.
# POST /api/matches/{id}/join.
# POST /api/matches/{id}/ready.
# POST /api/matches/{id}/finish.
# GET /api/matches/{id}. 
# GET /api/matches/my.

from django.urls import path, include
from .views import MatchListViewMy, MatchListViewAvailable, MatchActionView, MatchListViewCurrent
from .views_stat import StatsUserView, StatsTotalView
from .views_users import MatchUsersView
from .views_milestones import MilestonesView

    
urlpatterns = [
    path("api/matches/", MatchListViewMy.as_view()),                 # POST create, GET my

    path("api/matches/available/", MatchListViewAvailable.as_view()),   # GET available matches
    path("api/matches/current/", MatchListViewCurrent.as_view()),   # GET current matches

    path("api/matches/<uuid:match_id>/", MatchActionView.as_view()),     # GET detail
    path("api/matches/<uuid:match_id>/join/", MatchActionView.as_view()),
    path("api/matches/<uuid:match_id>/ready/", MatchActionView.as_view()),
    path("api/matches/<uuid:match_id>/finish/", MatchActionView.as_view()),

    path("api/matches/user/<int:user_id>/", MatchUsersView.as_view()),
    # path("api/matches/<uuid:match_id>/users/", MatchUsersView.as_view()),

    path("api/stats/<int:user_id>/", StatsUserView.as_view()),
    path("api/stats/", StatsTotalView.as_view()),

    path("api/milestones/", MilestonesView.as_view()),

]