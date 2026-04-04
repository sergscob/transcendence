from django.conf import settings
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Lazy loading of model and tokenizer
tokenizer = None
model = None

def load_model():
    global tokenizer, model
    if tokenizer is None or model is None:
        model_name = settings.CHATBOT_MODEL_NAME
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)

       

def generate_bot_response(chat_history_ids, message):
    # Add system prompt 
    if chat_history_ids is None:
        message = f"{settings.CHATBOT_SYSTEM_PROMPT}\n{message}"
        print("System prompt added to message:", message)
    
    new_input_ids = tokenizer.encode(
        message + tokenizer.eos_token,
        return_tensors='pt'
    )

    if chat_history_ids is not None:
        bot_input_ids = torch.cat([chat_history_ids, new_input_ids], dim=-1)
    else:
        bot_input_ids = new_input_ids

    next_chat_history_ids = model.generate(
        bot_input_ids,
        max_length=1000,
        pad_token_id=tokenizer.eos_token_id,
        do_sample=True,
        top_k=50,
        top_p=0.95
    )

    response = tokenizer.decode(
        next_chat_history_ids[:, bot_input_ids.shape[-1]:][0],
        skip_special_tokens=True
    )
    return response, next_chat_history_ids
