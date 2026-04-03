from channels.generic.websocket import AsyncJsonWebsocketConsumer 
from django.conf import settings

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import asyncio

# Lazy loading of model and tokenizer
tokenizer = None
model = None

def load_model():
    global tokenizer, model
    if tokenizer is None or model is None:
        model_name = settings.CHATBOT_MODEL_NAME
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)



class ChatConsumer(AsyncJsonWebsocketConsumer ):
    print ("ChatConsumer initialized")
    async def connect(self):
        load_model()  # Load model when consumer connects
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

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (already parsed as dict)
    async def receive_json(self, content, **kwargs):
        message = content['message']
        username = content['username']
        user_id = content['user_id']

        print ("Received message:", message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': username,
                'user_id': user_id,                
            }
        )

    async def receive_json(self, content, **kwargs):
        message = content['message']
        username = content['username']
        user_id = content['user_id']

        print("Received message:", message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': username,
                'user_id': user_id,
            }
        )

        # BOT

        bot_response = await asyncio.to_thread(self.generate_bot_response, message)
        
        print("Bot response:", bot_response)

        # Отправляем ответ бота в чат
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': bot_response,
                'username': 'Bot',
                'user_id': 0,
            }
        )

        

    # Receive message from room group
    async def chat_message(self, event):
        print ("Chat message:", event['message'])

        message = event['message']

        # Send message to WebSocket (as JSON)
        await self.send_json({
            'message': message,
            'username': event['username'],
            'user_id': event['user_id']
        })












        

    def generate_bot_response(self, message):
        # Add system prompt at the start of conversation
        # if self.chat_history_ids is None:
        #     message = f"{settings.CHATBOT_SYSTEM_PROMPT}\n{message}"
        #     print("System prompt added to message:", message)
        
        new_input_ids = tokenizer.encode(
            message + tokenizer.eos_token,
            return_tensors='pt'
        )

        if self.chat_history_ids is not None:
            bot_input_ids = torch.cat([self.chat_history_ids, new_input_ids], dim=-1)
        else:
            bot_input_ids = new_input_ids

        self.chat_history_ids = model.generate(
            bot_input_ids,
            max_length=1000,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=True,
            top_k=50,
            top_p=0.95
        )

        return tokenizer.decode(
            self.chat_history_ids[:, bot_input_ids.shape[-1]:][0],
            skip_special_tokens=True
        )        
