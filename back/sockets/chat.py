from channels.generic.websocket import AsyncJsonWebsocketConsumer 
from django.conf import settings
from collections import deque

# from .bot import load_model, generate_bot_response
import asyncio

ROOM_CHAT_HISTORY = {}

def get_room_history(room_name):
    history = ROOM_CHAT_HISTORY.get(room_name)
    if history is None:
        history = deque(maxlen=getattr(settings, 'CHAT_MEMORY_LIMIT', 100))
        ROOM_CHAT_HISTORY[room_name] = history
    return history


class ChatConsumer(AsyncJsonWebsocketConsumer ):

    async def connect(self):
        # load_model()  
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        self.chat_history_ids = None

        print ("Connecting to room:", self.room_name)
        # raise Exception("Test") 
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        await self.send_room_history()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content, **kwargs):
        message = content['message']
        username = content['username']
        user_id = content['user_id']

        print("Received message:", message)

        user_message_event = {
            'type': 'chat_message',
            'message': message,
            'username': username,
            'user_id': user_id,
        }
        self.append_to_history(user_message_event)

        await self.channel_layer.group_send(
            self.room_group_name,
            user_message_event
        )

        # BOT
        # bot_response, self.chat_history_ids = await asyncio.to_thread(
        #     generate_bot_response,
        #     self.chat_history_ids,
        #     message,
        # )
        # print("Bot response:", bot_response)

        # bot_message_event = {
        #     'type': 'chat_message',
        #     'message': bot_response,
        #     'username': 'Bot',
        #     'user_id': 0,
        # }
        # self.append_to_history(bot_message_event)

        # await self.channel_layer.group_send(
        #     self.room_group_name,
        #     bot_message_event
        # )

    async def chat_message(self, event):
        print ("Chat message:", event['message'])

        await self.send_json({
            'message': event['message'],
            'username': event['username'],
            'user_id': event['user_id']
        })

    async def send_room_history(self):
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
