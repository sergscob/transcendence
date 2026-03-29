from django.utils import timezone

class UpdateLastSeenMixin:
    def initial(self, request, *args, **kwargs):
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            user.last_seen = timezone.now()
            user.save(update_fields=["last_seen"])
        return super().initial(request, *args, **kwargs)
