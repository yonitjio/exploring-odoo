import os
import sys
import time

# import debugpy

from PyQt6 import QtCore
from PyQt6.QtCore import Qt, pyqtSignal, QThread
from PyQt6.QtGui import QMovie
from PyQt6.QtWidgets import QApplication, QMainWindow, QSplashScreen, QWidget, QLabel, QPlainTextEdit, QVBoxLayout, QLineEdit

from config import Config
from frostt import SpeechToText
from frotts import TextToSpeech

from calendar_bot import CalendarBot

class TextToSpeechThread(QThread):
    textSpoken = pyqtSignal()

    def __init__(self, speaker):
        super().__init__()
        self.speaker = speaker
        self.text = ""

    def run(self):
        # debugpy.debug_this_thread()
        while True:
            if self.text.strip() != "":
                self.speaker.speak(self.text.strip())
                self.textSpoken.emit()
                self.text = ""
            time.sleep(0.1)

    def speak(self, text):
        self.text = text.strip()

class CalendarBotThread(QThread):
    queryProcessed = pyqtSignal(str)

    def __init__(self, calendar_bot):
        super().__init__()
        self.calendar_bot = calendar_bot
        self.text = ""

    def run(self):
        # debugpy.debug_this_thread()
        while True:
            if self.text.strip() != "":
                res = self.calendar_bot.query(self.text.strip())
                self.queryProcessed.emit(res)
                self.text = ""
            time.sleep(0.1)

    def query(self, text):
        self.text = text.strip()

class SpeechToTextThread(QThread):
    textRetrieved = pyqtSignal(str)

    def __init__(self, recorder):
        super().__init__()
        self.recorder = recorder
        self.active = False

    def run(self):
        # debugpy.debug_this_thread()
        while True:
            if self.active:
                self.active = False
                text = self.recorder.text()
                self.textRetrieved.emit(text)
            time.sleep(0.1)

    def activate(self):
        self.active = True

class MainWindow(QMainWindow):
    updateUI = pyqtSignal()
    updateGif = pyqtSignal(object)

    def __init__(self):
        super().__init__()

        dir_path = os.path.dirname(os.path.abspath(__file__))

        self.setWindowTitle("Frodoo - Odoo Voice Assistant")
        self.setWindowFlag(Qt.WindowType.WindowStaysOnTopHint, True)

        gif_path = os.path.join(dir_path, "assets", "podcast.gif")
        self.microphone_gif = QMovie(gif_path)
        self.microphone_gif.setCacheMode(QMovie.CacheMode.CacheAll)

        gif_path = os.path.join(dir_path, "assets","hourglass.gif")
        self.hourglass_gif = QMovie(gif_path)
        self.hourglass_gif.setCacheMode(QMovie.CacheMode.CacheAll)

        self.gif_label = QLabel()
        self.gif_label.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
        self.gif_label.setMovie(self.hourglass_gif)

        self.status_widget = QLineEdit()
        self.status_widget.setReadOnly(True)

        self.user_text_widget = QPlainTextEdit()
        self.user_text_widget.setReadOnly(True)

        layout = QVBoxLayout()
        layout.addWidget(self.gif_label)
        layout.addWidget(self.status_widget)
        layout.addWidget(self.user_text_widget)

        self.microphone_gif.setScaledSize(QtCore.QSize(256, 256))
        self.hourglass_gif.setScaledSize(QtCore.QSize(256, 256))

        self.resize(QtCore.QSize(256,512))
        self.setFixedSize(self.width(), self.height())

        w = QWidget()
        w.setLayout(layout)

        self.setCentralWidget(w)
        self.microphone_gif.jumpToFrame(0)

        self.updateUI.connect(self._update_ui)
        self.updateGif.connect(self._update_gif)

        self.speech_to_text = None
        self.speech_to_text_thread = None

        self.text_to_speech = None
        self.text_to_speech_thread = None

        self.calendar_bot = None
        self.calendar_bot_thread = None

        self.config = None

        self.status_text = ""
        self.user_text = ""


        self.is_busy = False

    def set_status_text(self, text):
        self.status_text = text
        self.updateUI.emit()

    def _update_ui(self):
        self.status_widget.setText(self.status_text)
        self.user_text_widget.setPlainText(self.user_text)
        self.update()

    def _update_gif(self, gif_type):
        if gif_type["type"] == 0:
            self.gif_label.setMovie(self.microphone_gif)
            if gif_type["animate"] is True:
                self.microphone_gif.start()
            else:
                self.microphone_gif.stop()

            self.hourglass_gif.stop()
        else:
            self.gif_label.setMovie(self.hourglass_gif)
            if gif_type["animate"] is True:
                self.hourglass_gif.start()
            else:
                self.hourglass_gif.stop()

            self.microphone_gif.stop()

    def _emit_gif_update(self, gif_type, animate):
        self.updateGif.emit({
                "type": gif_type,
                "animate": animate
            })

    def recorder_state_changed(self, old_state, new_state):
        if not self.is_busy:
            self.set_status_text(new_state)

            if new_state in ["recording"]:
                self._emit_gif_update(0, True)
            else:
                self._emit_gif_update(0, False)

    def recorder_inactive(self):
        if not self.is_busy:
            self.speech_to_text_thread.activate()

    def text_detected(self, detected_text):
        self.set_status_text(detected_text)

    def process_user_text(self, user_text):
        user_text = user_text.strip()
        if len(user_text) > 0:
            self.is_busy = True

            self.user_text = user_text
            self.set_status_text("processing")
            self._emit_gif_update(1, True)

            self.calendar_bot_thread.query(user_text)

    def query_processed(self, ai_response_text):
        response_text = ai_response_text.strip()
        if len(response_text) > 0:
            self.user_text = ai_response_text
            self.updateUI.emit()
            self.text_to_speech_thread.speak(response_text)

    def text_spoken(self):
        self.is_busy = False
        self.speech_to_text_thread.activate()
        state = self.speech_to_text.state
        self.set_status_text(state)
        if self.speech_to_text.state in ["recording"]:
            self._emit_gif_update(0, True)
        else:
            self._emit_gif_update(0, False)

    def init_config(self):
        self.config = Config()

    def init_speech_to_text(self):
        self.speech_to_text = SpeechToText(
                config=self.config,
                on_realtime_transcription_stabilized=self.text_detected,
                on_state_change=self.recorder_state_changed,
                on_inactive=self.recorder_inactive
            )
        self.speech_to_text_thread = SpeechToTextThread(self.speech_to_text)
        self.speech_to_text_thread.textRetrieved.connect(self.process_user_text)
        self.speech_to_text_thread.start()
        self.speech_to_text_thread.activate()

    def init_calendar_bot(self):
        self.calendar_bot = CalendarBot(config=self.config)
        self.calendar_bot_thread = CalendarBotThread(calendar_bot=self.calendar_bot)
        self.calendar_bot_thread.queryProcessed.connect(self.query_processed)
        self.calendar_bot_thread.start()

    def init_text_to_speech(self):
        self.text_to_speech = TextToSpeech(self.config)
        self.text_to_speech_thread = TextToSpeechThread(self.text_to_speech)
        self.text_to_speech_thread.textSpoken.connect(self.text_spoken)
        self.text_to_speech_thread.start()

class SplashScreenThread(QThread):
    progressChanged = pyqtSignal(str)

    def __init__(self, main_window: MainWindow):
        super().__init__()
        self.main_window = main_window

    def run(self):
        self.progressChanged.emit("Initializing configuration...")
        self.main_window.init_config()
        self.progressChanged.emit("Initializing speech to text...")
        self.main_window.init_speech_to_text()
        self.progressChanged.emit("Initializing calendar bot...")
        self.main_window.init_calendar_bot()
        self.progressChanged.emit("Initializing text to speech...")
        self.main_window.init_text_to_speech()
        self.progressChanged.emit("Finished.")

class SplashScreen(QSplashScreen):
    def __init__(self, filepath, flags=0):
        super().__init__(flags=flags)
        self.movie = QMovie(filepath, parent=self)
        self.movie.setScaledSize(QtCore.QSize(256, 256))
        self.movie.frameChanged.connect(self.handleFrameChange)
        self.movie.start()

    def updateProgress(self, message):
        self.showMessage(message, Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignBottom, Qt.GlobalColor.blue)

    def handleFrameChange(self):
        pixmap = self.movie.currentPixmap()
        self.setPixmap(pixmap)
        self.setMask(pixmap.mask())

if __name__ == '__main__':
    app = QApplication(sys.argv)

    window = MainWindow()
    path = os.path.dirname(os.path.abspath(__file__))
    gf = os.path.join(path, "assets", "hourglass.gif")
    splash = SplashScreen(gf, Qt.WindowType.WindowStaysOnTopHint)
    splash_thread = SplashScreenThread(window)
    splash_thread.progressChanged.connect(splash.updateProgress)
    splash_thread.finished.connect(lambda: (splash.finish(window), window.show()))
    splash.show()
    splash_thread.start()

    sys.exit(app.exec())
