from django.conf import settings
from django.db import models

class Friend(models.Model):
    def __str__(self):
        return f"{self.user.username} - {self.friend.username}. Accepted: {self.accepted}"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friendship_creator_set', on_delete=models.CASCADE)
    friend = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friend_set', on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    