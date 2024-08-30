import torch
import requests 

from PIL import Image 
from transformers import AutoModelForCausalLM 
from transformers import AutoProcessor 
from transformers import BitsAndBytesConfig
from transformers import set_seed

class Phi3Vision:
    MODEL_ID = "microsoft/Phi-3-vision-128k-instruct" 

    def load(self):
        set_seed(1)
        self.bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
        )
        self.processor = AutoProcessor.from_pretrained(Phi3Vision.MODEL_ID, trust_remote_code=True)
        self.model = AutoModelForCausalLM.from_pretrained(
                        Phi3Vision.MODEL_ID, 
                        device_map="cuda", 
                        trust_remote_code=True, 
                        torch_dtype="auto", 
                        quantization_config=self.bnb_config,
                        _attn_implementation='flash_attention_2'
                    )

    def infer(self, prompt_text, image_url):
        messages = [{"role": "user", "content": f"<|image_1|>\n{prompt_text}"}]
        image = Image.open(requests.get(image_url, stream=True).raw)
        prompt = self.processor.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = self.processor(prompt, [image], return_tensors="pt").to("cuda")

        generation_args = { 
            "max_new_tokens": 512,
            "temperature": 0.1, 
            "do_sample": True, 
        } 

        generate_ids = self.model.generate(**inputs, eos_token_id=self.processor.tokenizer.eos_token_id, **generation_args) 
        generate_ids = generate_ids[:, inputs["input_ids"].shape[1] :]
        response = self.processor.batch_decode(generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0] 
        return response