import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

import queue
import threading

import torch

from tortoise.api_fast import TextToSpeech as TortoiseTTS
from tortoise.utils.audio import load_voices
from tortoise.utils.text import split_and_recombine_text
from tortoise.models.stream_generator import StreamGenerationConfig

import sounddevice as sd

from config import Config

class TextToSpeech:
    def __init__(self,
                config: Config,
            ) -> None:
        self.config = config

    def play_audio(self, audio_queue):
        while True:
            chunk = audio_queue.get()
            if chunk is None:
                break
            sd.play(chunk.cpu().numpy(), samplerate=24000)
            sd.wait()

    def speak(self, text: str) -> None:
        if text.strip() == "":
            return

        texts = split_and_recombine_text(text)

        use_deepspeed = self.config.tortoise_use_deepspeed
        if torch.backends.mps.is_available():
            use_deepspeed = False

        tts = TortoiseTTS(models_dir=self.config.tortoise_model_directory,
                           kv_cache=self.config.tortoise_kv_cache,
                           half=self.config.tortoise_half_precision,
                           use_deepspeed=use_deepspeed,
                           enable_redaction=False
                        )

        audio_queue = queue.Queue()
        playback_thread = threading.Thread(target=self.play_audio, args=(audio_queue,))
        playback_thread.start()

        voice_samples, _ = load_voices([self.config.tortoise_voice])
        for _, txt in enumerate(texts):
            audio_generator = tts.tts_stream(txt,
                                             voice_samples=voice_samples,
                                             use_deterministic_seed=self.config.tortoise_seed,
                                             generation_config=StreamGenerationConfig()
                                            )

            for wav_chunk in audio_generator:
                audio_queue.put(wav_chunk)

        audio_queue.put(None)
        playback_thread.join()
