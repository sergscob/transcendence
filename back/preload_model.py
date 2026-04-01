# preload_model.py
from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "microsoft/DialoGPT-small"

print("Downloading model...")

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

print("Done!")