from channels.generic.websocket import AsyncJsonWebsocketConsumer 

class ChatConsumer(AsyncJsonWebsocketConsumer ):
    print ("ChatConsumer initialized")
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        print ("Connecting to room:", self.room_name)
        # raise Exception("Test") 
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (already parsed as dict)
    async def receive_json(self, content, **kwargs):
        message = content['message']

        print ("Received message:", message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        print ("Chat message:", event['message'])

        message = event['message']

        # Send message to WebSocket (as JSON)
        await self.send_json({
            'message': message
        })
