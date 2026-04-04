from channels.generic.websocket import AsyncJsonWebsocketConsumer 

ROOM_GAME_STATE = {}

class PlayerConsumer(AsyncJsonWebsocketConsumer ):

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'
        self.user_id = None

        print ("Connecting to room:", self.room_name)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()
        await self.send_room_state()

    async def disconnect(self, close_code):
        if self.user_id is not None:
            ROOM_GAME_STATE.pop(self.user_id, None)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        print("Received state:", content['state'])
        self.user_id = content['user_id']

        user_event = {
            'type': 'game_message',
            'state': content['state'],
            'user_id': content['user_id'],
        }
        self.update_game_state(user_event)

        await self.channel_layer.group_send(self.room_group_name, user_event)

    async def game_message(self, event):
        print ("Game message:", event['state'])

        await self.send_json({
            'state': event['state'],
            'user_id': event['user_id']
        })

    async def send_room_state(self):
        states = list(ROOM_GAME_STATE.values())
        for item in states:
            await self.send_json({
                'state': item['state'],
                'user_id': item['user_id'],
            })

    def update_game_state(self, event):
        ROOM_GAME_STATE[event['user_id']] = {  
            'state': event['state'],
            'user_id': event['user_id'],
        }
