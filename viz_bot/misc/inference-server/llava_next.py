import torch
import requests

from PIL import Image
from transformers import BitsAndBytesConfig
from transformers import LlavaNextProcessor, LlavaNextForConditionalGeneration, LlavaNextConfig

class LlavaNext:
    MODEL_ID = "llava-hf/llava-v1.6-mistral-7b-hf" 

    def load(self):
        self.bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
        )
        self.processor = LlavaNextProcessor.from_pretrained(LlavaNext.MODEL_ID)

        self.model = LlavaNextForConditionalGeneration.from_pretrained(
                        LlavaNext.MODEL_ID,
                        quantization_config=self.bnb_config,
                        low_cpu_mem_usage=True,
                        attn_implementation="flash_attention_2",
                        torch_dtype=torch.bfloat16,
                    )
        
        # self.model.to("cuda")


    def infer(self, prompt_text, image_url):
        conversation = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"{prompt_text}"},
                    {"type": "image"},
                ],
            },
        ]

        image = Image.open(requests.get(image_url, stream=True).raw)

        self.processor.tokenizer.padding_side = "left"

        prompt = self.processor.apply_chat_template(conversation, add_generation_prompt=True)
        inputs = self.processor(prompt, image, padding=True, return_tensors="pt").to("cuda")
        generation_args = { 
            "max_new_tokens": 100,
            "pad_token_id": self.processor.tokenizer.eos_token_id
        } 

        output = self.model.generate(**inputs, **generation_args) 
        response = self.processor.decode(output[0], skip_special_tokens=True)
        return response