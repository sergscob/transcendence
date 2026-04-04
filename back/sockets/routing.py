from django.urls import re_path
from . import chat

websocket_urlpatterns = [
    re_path(r'^ws/chat/(?P<room_name>\w+)/$', chat.ChatConsumer.as_asgi()),
    # re_path(r'^.*$', consumer.ChatConsumer.as_asgi()),
    
    # re_path(r'^ws/chat/(?P<room_name>\w+)/$', consumer.ChatConsumer.as_asgi()),
]
