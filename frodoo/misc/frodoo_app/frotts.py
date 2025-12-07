import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

import os
import subprocess
import tempfile


dlldir = "lib\\mpv"
basepath = os.path.dirname(os.path.abspath(__file__))
dllspath = os.path.join(basepath, dlldir)
if not dlldir in os.environ['PATH']:
    os.environ['PATH'] = dllspath + os.pathsep + os.environ['PATH']

import mpv

from config import Config

class TextToSpeech:
    def __init__(self, config: Config) -> None:
        self.config = config


    def speak(self, text: str) -> None:
        mp3_fname = None
        vtt_fname = None
        try:
            media = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
            media.close()

            subtitle = tempfile.NamedTemporaryFile(suffix=".vtt", delete=False)
            subtitle.close()

            vtt_fname = subtitle.name
            mp3_fname = media.name

            args = [
                    "edge-tts",
                    f"--write-media={mp3_fname}",
                    f"--write-subtitles={vtt_fname}",
                    f"-t=\"{text}\"",
                    f"-v={self.config.edge_tts_voice}"
                ]

            with subprocess.Popen(
                args
            ) as process:
                process.communicate()

            player = mpv.MPV()
            player.play(mp3_fname)
            player.wait_for_playback()
        finally:
            if mp3_fname is not None and os.path.exists(mp3_fname):
                os.unlink(mp3_fname)
            if vtt_fname is not None and os.path.exists(vtt_fname):
                os.unlink(vtt_fname)
