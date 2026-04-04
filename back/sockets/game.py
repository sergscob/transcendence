from channels.generic.websocket import AsyncJsonWebsocketConsumer 
from django.conf import settings
from collections import deque

ROOM_GAME_STATE = {}

class PlayerConsumer(AsyncJsonWebsocketConsumer ):

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'

        self.chat_history_ids = None

        print ("Connecting to room:", self.room_name)
        # raise Exception("Test") 
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        await self.send_room_state()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content, **kwargs):
        message = content['message']
        user_id = content['user_id']

        print("Received message:", message)

        user_message_event = {
            'type': 'game_message',
            'message': message,
            'user_id': user_id,
        }
        self.update_game_state(user_message_event)

        await self.channel_layer.group_send(
            self.room_group_name,
            user_message_event
        )

    async def game_message(self, event):
        print ("Game message:", event['message'])

        await self.send_json({
            'message': event['message'],
            'user_id': event['user_id']
        })

    async def send_room_state(self):
        room_messages = list(get_room_history(self.room_name))
        for item in room_messages:
            await self.send_json({
                'message': item['message'],
                'username': item['username'],
                'user_id': item['user_id'],
            })

    def append_to_history(self, event):
        get_room_history(self.room_name).append({
            'message': event['message'],
            'username': event['username'],
            'user_id': event['user_id'],
        })
