from django.conf import settings
from django.db import models

class Friend(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friendship_creator_set', on_delete=models.CASCADE)
    friend = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friend_set', on_delete=models.CASCADE)
    wait_accept = models.BooleanField(default=True)
    want_to_be_friend = models.BooleanField(default=True)
    accepted = models.BooleanField(default=False)
    