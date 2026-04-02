# preload_model.py
from transformers import AutoTokenizer, AutoModelForCausalLM
from core import settings

model_name = settings.CHATBOT_MODEL_NAME

print("Downloading model...")

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

print("Done!")