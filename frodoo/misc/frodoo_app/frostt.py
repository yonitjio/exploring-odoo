# -*- coding: utf-8 -*-

"""

The SpeechToText class in the provided code facilitates fast speech-to-text transcription.
Originally developed as AudioToTextRecorder class by Kolja Beigel

The class employs the faster_whisper library to transcribe the recorded audio
into text using machine learning models, which can be run either on a GPU or
CPU. Voice activity detection (VAD) is built in, meaning the software can
automatically start or stop recording based on the presence or absence of
speech. It integrates wake word detection through the openwakeword library,
allowing the software to initiate recording when a specific word or phrase
is spoken. The system provides real-time feedback and can be further
customized.

Features:
- Voice Activity Detection: Automatically starts/stops recording when speech
  is detected or when speech ends.
- Wake Word Detection: Starts recording when a specified wake word (or words)
  is detected.
- Event Callbacks: Customizable callbacks for when recording starts
  or finishes.
- Fast Transcription: Returns the transcribed text from the audio as fast
  as possible.

Original Author: Kolja Beigel
Modified by Yoni Tjio for Frodoo (Voice Assistant for Odoo)

"""

import warnings

import os
import gc
import re
import copy
import time
import struct
import logging
import platform
import traceback
import threading
import itertools
import collections
from typing import Iterable, List, Optional, Union


import numpy as np
import sounddevice as sd
import openwakeword
import faster_whisper

import torch
import torch.multiprocessing as mp

from openwakeword.model import Model
from scipy import signal
from scipy.signal import resample

from config import Config

warnings.simplefilter(action='ignore', category=FutureWarning)

class SpeechToText:
    def __init__(self,
                config: Config,
                initial_prompt: Optional[Union[str, Iterable[int]]] = None,
                suppress_tokens: Optional[List[int]] = None,

                on_state_change=None,
                on_inactive=None,
                on_recording_start=None,
                on_recording_stop=None,
                on_transcription_start=None,

                # Realtime transcription parameters
                on_realtime_transcription_update=None,
                on_realtime_transcription_stabilized=None,

                # Voice activation parameters
                on_vad_detect_start=None,
                on_vad_detect_stop=None,

                # Wake word parameters
                on_wakeword_detected=None,
                on_wakeword_timeout=None,
                on_wakeword_detection_start=None,
                on_wakeword_detection_end=None,
                on_recorded_chunk=None
            ) -> None:
        self.config = config

        self.initial_prompt = initial_prompt
        self.suppress_tokens = suppress_tokens

        self.on_state_change = on_state_change
        self.on_inactive = on_inactive
        self.on_recording_start = on_recording_start
        self.on_recording_stop = on_recording_stop
        self.on_wakeword_detected = on_wakeword_detected
        self.on_wakeword_timeout = on_wakeword_timeout
        self.on_vad_detect_start = on_vad_detect_start
        self.on_vad_detect_stop = on_vad_detect_stop
        self.on_wakeword_detection_start = on_wakeword_detection_start
        self.on_wakeword_detection_end = on_wakeword_detection_end
        self.on_recorded_chunk = on_recorded_chunk
        self.on_transcription_start = on_transcription_start

        self.on_realtime_transcription_update = (
            on_realtime_transcription_update
        )
        self.on_realtime_transcription_stabilized = (
            on_realtime_transcription_stabilized
        )

        self.audio_queue = mp.Queue()

        self.recording_start_time = 0
        self.recording_stop_time = 0
        self.wake_word_detect_time = 0
        self.silero_check_time = 0
        self.silero_working = False
        self.speech_end_silence_start = 0

        self.listen_start = 0
        self.halo = None
        self.state = "inactive"
        self.wakeword_detected = False
        self.text_storage = []
        self.realtime_stabilized_text = ""
        self.realtime_stabilized_safetext = ""
        self.is_silero_speech_active = False
        self.recording_thread = None
        self.realtime_thread = None
        self.audio_interface = None
        self.audio = None
        self.stream = None
        self.start_recording_event = threading.Event()
        self.stop_recording_event = threading.Event()
        self.last_transcription_bytes = None
        self.use_wake_words = self.config.wake_words or self.config.wakeword_backend in {'oww', 'openwakeword', 'openwakewords'}

        self.buffer = bytearray()
        self.realtime_transcription_text = ""

        # Initialize the logging configuration with the specified level
        log_format = 'FroSTT: %(name)s - %(levelname)s - %(message)s'

        # Create a logger
        logger = logging.getLogger()
        logger.setLevel(self.config.level)  # Set the root logger's level

        # Create a file handler and set its level
        file_handler = logging.FileHandler(self.config.log_file)
        file_handler.setLevel(self.config.level)
        file_handler.setFormatter(logging.Formatter(log_format))

        # Create a console handler and set its level
        console_handler = logging.StreamHandler()
        console_handler.setLevel(self.config.level)
        console_handler.setFormatter(logging.Formatter(log_format))

        # Add the handlers to the logger
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

        self.is_shut_down = False
        self.shutdown_event = mp.Event()

        try:
            logging.debug("Explicitly setting the multiprocessing start method to 'spawn'")
            mp.set_start_method('spawn')
        except RuntimeError as e:
            logging.debug("Start method has already been set. Details: %s", e)

        logging.info("Starting SpeechToText")

        self.interrupt_stop_event = mp.Event()
        self.was_interrupted = mp.Event()
        self.main_transcription_ready_event = mp.Event()
        self.parent_transcription_pipe, child_transcription_pipe = mp.Pipe()

        # Set device for model
        self.config.device = "cuda" if self.config.device == "cuda" and torch.cuda.is_available() else "cpu"

        self.transcript_process = self._start_thread(
            target=SpeechToText._transcription_worker,
            args=(
                child_transcription_pipe,
                self.config.model_transcription,
                self.config.compute_type,
                self.config.gpu_device_index,
                self.config.device,
                self.main_transcription_ready_event,
                self.shutdown_event,
                self.interrupt_stop_event,
                self.config.beam_size,
                self.initial_prompt,
                self.suppress_tokens
            )
        )

        # Start audio data reading process
        if self.config.use_microphone:
            logging.info("Initializing audio recording (creating pyAudio input stream, sample rate: %s, buffer size: %s",
                         self.config.sample_rate, self.config.buffer_size)
            self.reader_process = self._start_thread(
                target=SpeechToText._audio_data_worker,
                args=(
                    self.audio_queue,
                    self.config.sample_rate,
                    self.config.buffer_size,
                    self.config.input_device_index,
                    self.shutdown_event,
                    self.interrupt_stop_event,
                    self.config.use_microphone
                )
            )

        # Initialize the realtime transcription model
        if self.config.enable_realtime_transcription:
            try:
                logging.info("Initializing faster_whisper realtime transcription model %s", self.config.realtime_model_type)
                self.realtime_model_type = faster_whisper.WhisperModel(
                    model_size_or_path=self.config.realtime_model_type,
                    device=self.config.device,
                    compute_type=self.config.compute_type,
                    device_index=self.config.gpu_device_index
                )

            except Exception as e:
                logging.exception("Error initializing faster_whisper realtime transcription model: %s", e)
                raise

            logging.debug("Faster_whisper realtime speech to text transcription model initialized successfully")

        # Setup wake word detection
        if self.config.wake_words or self.config.wakeword_backend in {'oww', 'openwakeword', 'openwakewords'}:
            self.wakeword_backend = self.config.wakeword_backend

            self.wake_words_list = [
                word.strip() for word in self.config.wake_words.lower().split(',')
            ]
            self.wake_words_sensitivity = self.config.wake_words_sensitivity
            self.wake_words_sensitivities = [
                float(self.config.wake_words_sensitivity)
                for _ in range(len(self.wake_words_list))
            ]


            openwakeword.utils.download_models(target_directory=self.config.openwakeword_model_directory)

            try:
                if self.config.openwakeword_model_directory and self.config.openwakeword_models:
                    models = self.config.openwakeword_models.split(',')
                    model_paths = []
                    for m in models:
                        model_path = os.path.join(self.config.openwakeword_model_directory, m)
                        model_paths.append(model_path)
                    melspec_model_path = os.path.join(self.config.openwakeword_model_directory, "melspectrogram.onnx")
                    embedding_model_path = os.path.join(self.config.openwakeword_model_directory, "embedding_model.onnx")
                    self.oww_model = Model(
                        wakeword_models=model_paths,
                        inference_framework=self.config.openwakeword_inference_framework,
                        melspec_model_path=melspec_model_path,
                        embedding_model_path=embedding_model_path
                    )
                    logging.info("Successfully loaded wakeword model(s): %s", self.config.openwakeword_models)
                else:
                    self.oww_model = Model(inference_framework=self.config.openwakeword_inference_framework)

                self.oww_n_models = len(self.oww_model.models.keys())
                if not self.oww_n_models:
                    logging.error(
                        "No wake word models loaded."
                    )

                for model_key in self.oww_model.models:
                    logging.info("Successfully loaded openwakeword model: %s", model_key)

            except Exception as e:
                logging.exception("Error initializing openwakeword wake word detection engine: %s", e)
                raise

            logging.debug("Open wake word detection engine initialized successfully")

        # Setup voice activity detection model Silero VAD
        try:
            self.silero_vad_model, _ = torch.hub.load(
                repo_or_dir="snakers4/silero-vad",
                model="silero_vad",
                verbose=False,
                onnx=self.config.silero_use_onnx
            )

        except Exception as e:
            logging.exception("Error initializing Silero VAD voice activity detection engine: %s", e)
            raise

        logging.debug("Silero VAD voice activity detection engine initialized successfully")

        self.audio_buffer = collections.deque(
            maxlen=int((self.config.sample_rate // self.config.buffer_size) *
                       self.config.pre_recording_buffer_duration)
        )
        self.frames = []

        # Recording control flags
        self.is_recording = False
        self.is_running = True
        self.start_recording_on_voice_activity = False
        self.stop_recording_on_voice_deactivity = False

        # Start the recording worker thread
        self.recording_thread = threading.Thread(target=self._recording_worker)
        self.recording_thread.daemon = True
        self.recording_thread.start()

        # Start the realtime transcription worker thread
        self.realtime_thread = threading.Thread(target=self._realtime_worker)
        self.realtime_thread.daemon = True
        self.realtime_thread.start()

        # Wait for transcription models to start
        logging.debug('Waiting for main transcription model to start')
        self.main_transcription_ready_event.wait()
        logging.debug('Main transcription model ready')

        logging.debug('FroSTT initialization completed successfully')

    def _start_thread(self, target=None, args=()):
        """
        Implement a consistent threading model across the library.

        This method is used to start any thread in this library. It uses the
        standard threading. Thread for Linux and for all others uses the pytorch
        MultiProcessing library 'Process'.
        Args:
            target (callable object): is the callable object to be invoked by
              the run() method. Defaults to None, meaning nothing is called.
            args (tuple): is a list or tuple of arguments for the target
              invocation. Defaults to ().
        """
        if platform.system() == 'Linux':
            thread = threading.Thread(target=target, args=args)
            thread.deamon = True
            thread.start()
            return thread
        else:
            thread = mp.Process(target=target, args=args)
            thread.start()
            return thread

    @staticmethod
    def _transcription_worker(conn,
                              model_path,
                              compute_type,
                              gpu_device_index,
                              device,
                              ready_event,
                              shutdown_event,
                              interrupt_stop_event,
                              beam_size,
                              initial_prompt,
                              suppress_tokens
                              ):
        """
        Worker method that handles the continuous
        process of transcribing audio data.

        This method runs in a separate process and is responsible for:
        - Initializing the `faster_whisper` model used for transcription.
        - Receiving audio data sent through a pipe and using the model
          to transcribe it.
        - Sending transcription results back through the pipe.
        - Continuously checking for a shutdown event to gracefully
          terminate the transcription process.

        Args:
            conn (multiprocessing.Connection): The connection endpoint used
              for receiving audio data and sending transcription results.
            model_path (str): The path to the pre-trained faster_whisper model
              for transcription.
            compute_type (str): Specifies the type of computation to be used
                for transcription.
            gpu_device_index (int): Device ID to use.
            device (str): Device for model to use.
            ready_event (threading.Event): An event that is set when the
              transcription model is successfully initialized and ready.
            shutdown_event (threading.Event): An event that, when set,
              signals this worker method to terminate.
            interrupt_stop_event (threading.Event): An event that, when set,
                signals this worker method to stop processing audio data.
            beam_size (int): The beam size to use for beam search decoding.
            initial_prompt (str or iterable of int): Initial prompt to be fed
                to the transcription model.
            suppress_tokens (list of int): Tokens to be suppressed from the
                transcription output.
        Raises:
            Exception: If there is an error while initializing the
            transcription model.
        """

        logging.info("Initializing faster_whisper main transcription model %s", model_path)

        try:
            model = faster_whisper.WhisperModel(
                model_size_or_path=model_path,
                device=device,
                compute_type=compute_type,
                device_index=gpu_device_index,
            )

        except Exception as e:
            logging.exception("Error initializing main faster_whisper transcription model: %s", e)
            raise

        ready_event.set()

        logging.debug("Faster_whisper main speech to text transcription model initialized successfully")

        while not shutdown_event.is_set():
            try:
                if conn.poll(0.5):
                    audio, language = conn.recv()
                    try:
                        segments = model.transcribe(
                            audio,
                            language=language if language else None,
                            beam_size=beam_size,
                            initial_prompt=initial_prompt,
                            suppress_tokens=suppress_tokens
                        )
                        segments = segments[0]
                        transcription = " ".join(seg.text for seg in segments)
                        transcription = transcription.strip()
                        conn.send(('success', transcription))
                    except Exception as e: # pylint: disable=broad-exception-caught
                        logging.error("General transcription error: %s", e)
                        conn.send(('error', str(e)))
                else:
                    # If there's no data, sleep / prevent busy waiting
                    time.sleep(0.02)
            except KeyboardInterrupt:
                interrupt_stop_event.set()
                logging.debug("Transcription worker process finished due to KeyboardInterrupt")
                break

    @staticmethod
    def _audio_data_worker(audio_queue,
                           sample_rate,
                           buffer_size,
                           input_device_index,
                           shutdown_event,
                           interrupt_stop_event,
                           use_microphone):
        """
        Worker method that handles the audio recording process.

        This method runs in a separate process and is responsible for:
        - Setting up the audio input stream for recording.
        - Continuously reading audio data from the input stream
          and placing it in a queue.
        - Handling errors during the recording process, including
          input overflow.
        - Gracefully terminating the recording process when a shutdown
          event is set.

        Args:
            audio_queue (queue.Queue): A queue where recorded audio
              data is placed.
            sample_rate (int): The sample rate of the audio input stream.
            buffer_size (int): The size of the buffer used in the audio
              input stream.
            input_device_index (int): The index of the audio input device
            shutdown_event (threading.Event): An event that, when set, signals
              this worker method to terminate.

        Raises:
            Exception: If there is an error while initializing the audio
              recording.
        """
        stream = sd.InputStream(
                samplerate=sample_rate,
                dtype=np.int16,
                channels=1,
                blocksize=buffer_size,
                device=input_device_index,
            )
        try:
            stream.start()
            while not shutdown_event.is_set():
                try:
                    data, overflow = stream.read(buffer_size)
                    if overflow:
                        logging.warning("Input overflowed. Frame dropped.")

                    elif use_microphone:
                        audio_queue.put(data)

                except Exception as e: # pylint: disable=broad-exception-caught
                    logging.error("Error during recording: %s", e)
                    tb_str = traceback.format_exc()
                    print("Traceback: %s", tb_str)
                    print("Error: %s", e)
                    continue

        except KeyboardInterrupt:
            interrupt_stop_event.set()
            logging.debug("Audio data worker process finished due to KeyboardInterrupt")
        finally:
            stream.close()

    def wakeup(self):
        """
        If in wake work modus, wake up as if a wake word was spoken.
        """
        self.listen_start = time.time()

    def abort(self):
        """
        Abort operations.
        """
        self.start_recording_on_voice_activity = False
        self.stop_recording_on_voice_deactivity = False
        self._set_state("inactive")
        self.interrupt_stop_event.set()
        self.was_interrupted.wait()
        self.was_interrupted.clear()

    def wait_audio(self):
        """
        Waits for the start and completion of the audio recording process.

        This method is responsible for:
        - Waiting for voice activity to begin recording if not yet started.
        - Waiting for voice inactivity to complete the recording.
        - Setting the audio buffer from the recorded frames.
        - Resetting recording-related attributes.

        Side effects:
        - Updates the state of the instance.
        - Modifies the audio attribute to contain the processed audio data.
        """

        self.listen_start = time.time()

        # If not yet started recording, wait for voice activity to initiate.
        if not self.is_recording and not self.frames:
            self._set_state("listening")
            self.start_recording_on_voice_activity = True

            # Wait until recording starts
            while not self.interrupt_stop_event.is_set():
                if self.start_recording_event.wait(timeout=0.02):
                    break

        # If recording is ongoing, wait for voice inactivity
        # to finish recording.
        if self.is_recording:
            self.stop_recording_on_voice_deactivity = True

            # Wait until recording stops
            while not self.interrupt_stop_event.is_set():
                if self.stop_recording_event.wait(timeout=0.02):
                    break

        # Convert recorded frames to the appropriate audio format.
        audio_array = np.frombuffer(b''.join(self.frames), dtype=np.int16)
        self.audio = audio_array.astype(np.float32) / self.config.int16_max_abs_value
        self.frames.clear()

        # Reset recording-related timestamps
        self.recording_stop_time = 0
        self.listen_start = 0

        self._set_state("inactive")

    def transcribe(self):
        """
        Transcribes audio captured by this class instance using the
        `faster_whisper` model.

        Automatically starts recording upon voice activity if not manually
          started using `recorder.start()`.
        Automatically stops recording upon voice deactivity if not manually
          stopped with `recorder.stop()`.
        Processes the recorded audio to generate transcription.

        Args:
            on_transcription_finished (callable, optional): Callback function
              to be executed when transcription is ready.
            If provided, transcription will be performed asynchronously,
              zand the callback will receive the transcription as its argument.
              If omitted, the transcription will be performed synchronously,
              and the result will be returned.

        Returns (if no callback is set):
            str: The transcription of the recorded audio.

        Raises:
            Exception: If there is an error during the transcription process.
        """
        self._set_state("transcribing")
        audio_copy = copy.deepcopy(self.audio)
        self.parent_transcription_pipe.send((self.audio, self.config.transcription_language))
        status, result = self.parent_transcription_pipe.recv()

        self._set_state("inactive")
        if status == 'success':
            self.last_transcription_bytes = audio_copy
            return self._preprocess_output(result)
        else:
            logging.error(result)
            raise Exception(result) # pylint: disable=broad-exception-raised

    def _process_wakeword(self, data):
        """
        Processes audio data to detect wake words.
        """
        if self.wakeword_backend in {'oww', 'openwakeword', 'openwakewords'}:
            pcm = np.frombuffer(data, dtype=np.int16)
            _ = self.oww_model.predict(pcm)
            max_score = -1
            max_index = -1
            wake_words_in_prediction = len(self.oww_model.prediction_buffer.keys())

            if wake_words_in_prediction:
                for idx, mdl in enumerate(self.oww_model.prediction_buffer.keys()):
                    scores = list(self.oww_model.prediction_buffer[mdl])
                    if scores[-1] >= self.wake_words_sensitivity and scores[-1] > max_score:
                        max_score = scores[-1]
                        max_index = idx
                if self.config.debug_mode:
                    print ("Wake words oww max_index, max_score: %s, %s", max_index, max_score)
                return max_index
            else:
                if self.config.debug_mode:
                    print ("Wake words oww_index: -1")
                return -1

        if self.config.debug_mode:
            print("Wake words no match")
        return -1

    def text(self, on_transcription_finished=None):
        """
        Transcribes audio captured by this class instance
        using the `faster_whisper` model.

        - Automatically starts recording upon voice activity if not manually
          started using `recorder.start()`.
        - Automatically stops recording upon voice deactivity if not manually
          stopped with `recorder.stop()`.
        - Processes the recorded audio to generate transcription.

        Args:
            on_transcription_finished (callable, optional): Callback function
              to be executed when transcription is ready.
            If provided, transcription will be performed asynchronously, and
              the callback will receive the transcription as its argument.
              If omitted, the transcription will be performed synchronously,
              and the result will be returned.

        Returns (if not callback is set):
            str: The transcription of the recorded audio
        """

        self.interrupt_stop_event.clear()
        self.was_interrupted.clear()

        self.wait_audio()

        if self.is_shut_down or self.interrupt_stop_event.is_set():
            if self.interrupt_stop_event.is_set():
                self.was_interrupted.set()
            return ""

        if on_transcription_finished:
            threading.Thread(target=on_transcription_finished,
                             args=(self.transcribe(),)).start()
        else:
            return self.transcribe()

    def start(self):
        """
        Starts recording audio directly without waiting for voice activity.
        """

        # Ensure there's a minimum interval
        # between stopping and starting recording
        if time.time() - self.recording_stop_time < self.config.min_gap_between_recordings:
            logging.info("Attempted to start recording too soon after stopping.")
            return self

        logging.info("Recording started")
        self.text_storage = []
        self.realtime_stabilized_text = ""
        self.realtime_stabilized_safetext = ""
        self.wakeword_detected = False
        self.wake_word_detect_time = 0
        self.frames = []
        self.is_recording = True
        self.recording_start_time = time.time()
        self.is_silero_speech_active = False
        self.stop_recording_event.clear()
        self.start_recording_event.set()

        self._set_state("recording")

        return self

    def stop(self):
        """
        Stops recording audio.
        """

        # Ensure there's a minimum interval
        # between starting and stopping recording
        if time.time() - self.recording_start_time < self.config.min_length_of_recording:
            logging.info("Attempted to stop recording too soon after starting.")
            return self

        logging.info("recording stopped")
        self.is_recording = False
        self.recording_stop_time = time.time()
        self.is_silero_speech_active = False
        self.silero_check_time = 0
        self.start_recording_event.clear()
        self.stop_recording_event.set()

        if self.on_recording_stop:
            self.on_recording_stop()

        return self

    def feed_audio(self, chunk, original_sample_rate=16000):
        """
        Feed an audio chunk into the processing pipeline. Chunks are
        accumulated until the buffer size is reached, and then the accumulated
        data is fed into the audio_queue.
        """
        # Check if input is a NumPy array
        if isinstance(chunk, np.ndarray):
            # Handle stereo to mono conversion if necessary
            if chunk.ndim == 2:
                chunk = np.mean(chunk, axis=1)

            # Resample to 16000 Hz if necessary
            if original_sample_rate != 16000:
                num_samples = int(len(chunk) * 16000 / original_sample_rate)
                chunk = resample(chunk, num_samples)

            # Ensure data type is int16
            chunk = chunk.astype(np.int16)

            # Convert the NumPy array to bytes
            chunk = chunk.tobytes()

        # Append the chunk to the buffer
        self.buffer += chunk
        buf_size = 2 * self.config.buffer_size  # silero complains if too short

        # Check if the buffer has reached or exceeded the buffer_size
        while len(self.buffer) >= buf_size:
            # Extract self.buffer_size amount of data from the buffer
            to_process = self.buffer[:buf_size]
            self.buffer = self.buffer[buf_size:]

            # Feed the extracted data to the audio_queue
            self.audio_queue.put(to_process)

    def set_microphone(self, microphone_on=True):
        """
        Set the microphone on or off.
        """
        logging.info("Setting microphone to: %s", microphone_on)
        self.config.use_microphone = microphone_on

    def shutdown(self):
        """
        Safely shuts down the audio recording by stopping the
        recording worker and closing the audio stream.
        """

        # Force wait_audio() and text() to exit
        self.is_shut_down = True
        self.start_recording_event.set()
        self.stop_recording_event.set()

        self.shutdown_event.set()
        self.is_recording = False
        self.is_running = False

        logging.debug('Finishing recording thread')
        if self.recording_thread:
            self.recording_thread.join()

        logging.debug('Terminating reader process')

        # Give it some time to finish the loop and cleanup.
        if self.config.use_microphone:
            self.reader_process.join(timeout=10)

        if self.reader_process.is_alive():
            logging.warning("Reader process did not terminate in time. Terminating forcefully.")
            self.reader_process.terminate()

        logging.debug('Terminating transcription process')
        self.transcript_process.join(timeout=10)

        if self.transcript_process.is_alive():
            logging.warning("Transcript process did not terminate in time. Terminating forcefully.")
            self.transcript_process.terminate()

        self.parent_transcription_pipe.close()

        logging.debug('Finishing realtime thread')
        if self.realtime_thread:
            self.realtime_thread.join()

        if self.config.enable_realtime_transcription:
            if self.config.realtime_model_type:
                del self.config.realtime_model_type
                self.config.realtime_model_type = None
        gc.collect()

    def _recording_worker(self):
        """
        The main worker method which constantly monitors the audio
        input for voice activity and accordingly starts/stops the recording.
        """

        logging.debug('Starting recording worker')

        try:
            was_recording = False
            delay_was_passed = False

            # Continuously monitor audio for voice activity
            while self.is_running:

                try:

                    data = self.audio_queue.get()
                    if self.on_recorded_chunk:
                        self.on_recorded_chunk(data)

                    if self.config.handle_buffer_overflow:
                        # Handle queue overflow
                        if self.audio_queue.qsize() > self.config.allowed_latency_limit:
                            logging.warning("Audio queue size exceeds latency limit. Current size: %s. Discarding old audio chunks.",
                                            self.audio_queue.qsize())

                        while self.audio_queue.qsize() > self.config.allowed_latency_limit:
                            data = self.audio_queue.get()

                except BrokenPipeError:
                    print("BrokenPipeError _recording_worker")
                    self.is_running = False
                    break

                if not self.is_recording:
                    # Handle not recording state
                    time_since_listen_start = (time.time() - self.listen_start if self.listen_start else 0)

                    wake_word_activation_delay_passed = time_since_listen_start > self.config.wake_word_activation_delay

                    # Handle wake-word timeout callback
                    if wake_word_activation_delay_passed \
                            and not delay_was_passed:

                        if self.use_wake_words and self.config.wake_word_activation_delay:
                            if self.on_wakeword_timeout:
                                self.on_wakeword_timeout()
                    delay_was_passed = wake_word_activation_delay_passed

                    # Set state and spinner text
                    if not self.recording_stop_time:
                        if self.use_wake_words \
                                and wake_word_activation_delay_passed \
                                and not self.wakeword_detected:
                            self._set_state("wakeword")
                            self.audio_buffer.clear()
                        else:
                            if self.listen_start:
                                self._set_state("listening")
                            else:
                                self._set_state("inactive")

                    #self.wake_word_detect_time = time.time()
                    if self.use_wake_words and wake_word_activation_delay_passed:
                        try:
                            wakeword_index = self._process_wakeword(data)

                        except struct.error:
                            logging.error("Error unpacking audio data for wake word processing.")
                            continue

                        except Exception as e: # pylint: disable=broad-exception-caught
                            logging.error("Wake word processing error: %s", e)
                            continue

                        # If a wake word is detected
                        if wakeword_index >= 0:

                            # Removing the wake word from the recording
                            samples_time = int(self.config.sample_rate * self.config.wake_word_buffer_duration)
                            start_index = max(0, len(self.audio_buffer) - samples_time)
                            temp_samples = collections.deque(itertools.islice(self.audio_buffer, start_index, None))
                            self.audio_buffer.clear()
                            self.audio_buffer.extend(temp_samples)

                            self.wake_word_detect_time = time.time()
                            self.wakeword_detected = True
                            #self.wake_word_cooldown_time = time.time()
                            if self.on_wakeword_detected:
                                self.on_wakeword_detected()

                    # Check for voice activity to
                    # trigger the start of recording
                    if ((not self.use_wake_words
                         or not wake_word_activation_delay_passed)
                            and self.start_recording_on_voice_activity) \
                            or self.wakeword_detected:

                        if self._is_voice_active():
                            logging.info("Voice activity detected")

                            self.start()

                            if self.is_recording:
                                self.start_recording_on_voice_activity = False

                                # Add the buffered audio
                                # to the recording frames
                                self.frames.extend(list(self.audio_buffer))
                                self.audio_buffer.clear()

                            self.silero_vad_model.reset_states()
                        else:
                            data_copy = data[:]
                            self._check_voice_activity(data_copy)

                    self.speech_end_silence_start = 0

                else:
                    # If we are currently recording

                    # Stop the recording if silence is detected after speech
                    if self.stop_recording_on_voice_deactivity:
                        is_speech = self._is_silero_speech(data)

                        if not is_speech:
                            # Voice deactivity was detected, so we start
                            # measuring silence time before stopping recording
                            if self.speech_end_silence_start == 0:
                                self.speech_end_silence_start = time.time()
                        else:
                            self.speech_end_silence_start = 0

                        # Wait for silence to stop recording after speech
                        if self.speech_end_silence_start and time.time() - \
                                self.speech_end_silence_start > \
                                self.config.post_speech_silence_duration:
                            logging.info("voice deactivity detected")
                            self.stop()

                if not self.is_recording and was_recording:
                    # Reset after stopping recording to ensure clean state
                    self.stop_recording_on_voice_deactivity = False

                if time.time() - self.silero_check_time > 0.1:
                    self.silero_check_time = 0

                # Handle wake word timeout (waited to long initiating
                # speech after wake word detection)
                if self.wake_word_detect_time and time.time() - self.wake_word_detect_time > self.config.wake_word_timeout:
                    self.wake_word_detect_time = 0
                    if self.wakeword_detected and self.on_wakeword_timeout:
                        self.on_wakeword_timeout()
                    self.wakeword_detected = False

                was_recording = self.is_recording

                if self.is_recording:
                    self.frames.append(data)

                if not self.is_recording or self.speech_end_silence_start:
                    self.audio_buffer.append(data)

        except Exception as e: # pylint: disable=broad-exception-caught
            if not self.interrupt_stop_event.is_set():
                logging.error("Unhandled exeption in _recording_worker: %s", e)
                raise

    def _realtime_worker(self):
        """
        Performs real-time transcription if the feature is enabled.

        The method is responsible transcribing recorded audio frames
          in real-time based on the specified resolution interval.
        The transcribed text is stored in `self.realtime_transcription_text`
          and a callback
        function is invoked with this text if specified.
        """

        try:
            logging.debug('Starting realtime worker')

            # Return immediately if real-time transcription is not enabled
            if not self.config.enable_realtime_transcription:
                return

            # Continue running as long as the main process is active
            while self.is_running:

                # Check if the recording is active
                if self.is_recording:

                    # Sleep for the duration of the transcription resolution
                    time.sleep(self.config.realtime_processing_pause)

                    # Convert the buffer frames to a NumPy array
                    audio_array = np.frombuffer(
                        b''.join(self.frames),
                        dtype=np.int16
                        )

                    # Normalize the array to a [-1, 1] range
                    audio_array = audio_array.astype(np.float32) / self.config.int16_max_abs_value

                    # Perform transcription and assemble the text
                    segments = self.realtime_model_type.transcribe(
                        audio_array,
                        language=self.config.transcription_language if self.config.transcription_language else None,
                        beam_size=self.config.beam_size_realtime,
                        initial_prompt=self.initial_prompt,
                        suppress_tokens=self.suppress_tokens,
                    )

                    # double check recording state
                    # because it could have changed mid-transcription
                    if self.is_recording and time.time() - \
                            self.recording_start_time > 0.5:

                        logging.debug('Starting realtime transcription')
                        self.realtime_transcription_text = " ".join(
                            seg.text for seg in segments[0]
                        )
                        self.realtime_transcription_text = \
                            self.realtime_transcription_text.strip()

                        self.text_storage.append(
                            self.realtime_transcription_text
                            )

                        # Take the last two texts in storage, if they exist
                        if len(self.text_storage) >= 2:
                            last_two_texts = self.text_storage[-2:]

                            # Find the longest common prefix
                            # between the two texts
                            prefix = os.path.commonprefix(
                                [last_two_texts[0], last_two_texts[1]]
                                )

                            # This prefix is the text that was transcripted
                            # two times in the same way
                            # Store as "safely detected text"
                            if len(prefix) >= \
                                    len(self.realtime_stabilized_safetext):

                                # Only store when longer than the previous
                                # as additional security
                                self.realtime_stabilized_safetext = prefix

                        # Find parts of the stabilized text
                        # in the freshly transcripted text
                        matching_pos = self._find_tail_match_in_text(
                            self.realtime_stabilized_safetext,
                            self.realtime_transcription_text
                            )

                        if matching_pos < 0:
                            if self.realtime_stabilized_safetext:
                                self._on_realtime_transcription_stabilized(
                                    self._preprocess_output(
                                        self.realtime_stabilized_safetext,
                                        True
                                    )
                                )
                            else:
                                self._on_realtime_transcription_stabilized(
                                    self._preprocess_output(
                                        self.realtime_transcription_text,
                                        True
                                    )
                                )
                        else:
                            # We found parts of the stabilized text
                            # in the transcripted text
                            # We now take the stabilized text
                            # and add only the freshly transcripted part to it
                            output_text = self.realtime_stabilized_safetext + \
                                self.realtime_transcription_text[matching_pos:]

                            # This yields us the "left" text part as stabilized
                            # AND at the same time delivers fresh detected
                            # parts on the first run without the need for
                            # two transcriptions
                            self._on_realtime_transcription_stabilized(
                                self._preprocess_output(output_text, True)
                                )

                        # Invoke the callback with the transcribed text
                        self._on_realtime_transcription_update(
                            self._preprocess_output(
                                self.realtime_transcription_text,
                                True
                            )
                        )

                # If not recording, sleep briefly before checking again
                else:
                    time.sleep(self.config.time_sleep)

        except Exception as e: # pylint: disable=broad-exception-caught
            logging.error("Unhandled exeption in _realtime_worker: %s", e)
            raise

    def _is_silero_speech(self, chunk):
        """
        Returns true if speech is detected in the provided audio data

        Args:
            data (bytes): raw bytes of audio data (1024 raw bytes with
            16000 sample rate and 16 bits per sample)
        """
        if self.config.sample_rate != 16000:
            pcm_data = np.frombuffer(chunk, dtype=np.int16)
            data_16000 = signal.resample_poly(pcm_data, 16000, self.config.sample_rate)
            chunk = data_16000.astype(np.int16).tobytes()

        self.silero_working = True
        audio_chunk = np.frombuffer(chunk, dtype=np.int16)
        audio_chunk = audio_chunk.astype(np.float32) / self.config.int16_max_abs_value
        vad_prob = self.silero_vad_model(
            torch.from_numpy(audio_chunk), self.config.sample_rate).item()
        is_silero_speech_active = vad_prob > (1 - self.config.silero_sensitivity)
        if is_silero_speech_active:
            self.is_silero_speech_active = True
        self.silero_working = False
        return is_silero_speech_active

    def _check_voice_activity(self, data):
        """
        Initiate check if voice is active based on the provided data.

        Args:
            data: The audio data to be checked for voice activity.
        """
        if not self.silero_working:
            self.silero_working = True

            # Run the intensive check in a separate thread
            threading.Thread(
                target=self._is_silero_speech,
                args=(data,)).start()

    def _is_voice_active(self):
        """
        Determine if voice is active.

        Returns:
            bool: True if voice is active, False otherwise.
        """
        return self.is_silero_speech_active

    def _set_state(self, new_state):
        """
        Update the current state of the recorder and execute
        corresponding state-change callbacks.

        Args:
            new_state (str): The new state to set.

        """
        # Check if the state has actually changed
        if new_state == self.state:
            return


        # Store the current state for later comparison
        old_state = self.state

        # Update to the new state
        self.state = new_state

        if self.on_state_change:
            self.on_state_change(old_state, new_state)

        # Execute callbacks based on transitioning FROM a particular state
        if old_state == "listening":
            if self.on_vad_detect_stop:
                self.on_vad_detect_stop()
        elif old_state == "wakeword":
            if self.on_wakeword_detection_end:
                self.on_wakeword_detection_end()

        # Execute callbacks based on transitioning TO a particular state
        if new_state == "listening":
            if self.on_vad_detect_start:
                self.on_vad_detect_start()
        elif new_state == "wakeword":
            if self.on_wakeword_detection_start:
                self.on_wakeword_detection_start()
        elif new_state == "transcribing":
            if self.on_transcription_start:
                self.on_transcription_start()
        elif new_state == "recording":
            if self.on_recording_start:
                self.on_recording_start()
        elif new_state == "inactive":
            if self.on_inactive:
                self.on_inactive()

    def _preprocess_output(self, text, preview=False):
        """
        Preprocesses the output text by removing any leading or trailing
        whitespace, converting all whitespace sequences to a single space
        character, and capitalizing the first character of the text.

        Args:
            text (str): The text to be preprocessed.

        Returns:
            str: The preprocessed text.
        """
        text = re.sub(r'\s+', ' ', text.strip())

        if self.config.ensure_sentence_starting_uppercase:
            if text:
                text = text[0].upper() + text[1:]

        # Ensure the text ends with a proper punctuation
        # if it ends with an alphanumeric character
        if not preview:
            if self.config.ensure_sentence_ends_with_period:
                if text and text[-1].isalnum():
                    text += '.'

        return text

    def _find_tail_match_in_text(self, text1, text2, length_of_match=10):
        """
        Find the position where the last 'n' characters of text1
        match with a substring in text2.

        This method takes two texts, extracts the last 'n' characters from
        text1 (where 'n' is determined by the variable 'length_of_match'), and
        searches for an occurrence of this substring in text2, starting from
        the end of text2 and moving towards the beginning.

        Parameters:
        - text1 (str): The text containing the substring that we want to find
          in text2.
        - text2 (str): The text in which we want to find the matching
          substring.
        - length_of_match(int): The length of the matching string that we are
          looking for

        Returns:
        int: The position (0-based index) in text2 where the matching
          substring starts. If no match is found or either of the texts is
          too short, returns -1.
        """

        # Check if either of the texts is too short
        if len(text1) < length_of_match or len(text2) < length_of_match:
            return -1

        # The end portion of the first text that we want to compare
        target_substring = text1[-length_of_match:]

        # Loop through text2 from right to left
        for i in range(len(text2) - length_of_match + 1):
            # Extract the substring from text2
            # to compare with the target_substring
            current_substring = text2[len(text2) - i - length_of_match:
                                      len(text2) - i]

            # Compare the current_substring with the target_substring
            if current_substring == target_substring:
                # Position in text2 where the match starts
                return len(text2) - i

        return -1

    def _on_realtime_transcription_stabilized(self, text):
        """
        Callback method invoked when the real-time transcription stabilizes.

        This method is called internally when the transcription text is
        considered "stable" meaning it's less likely to change significantly
        with additional audio input. It notifies any registered external
        listener about the stabilized text if recording is still ongoing.
        This is particularly useful for applications that need to display
        live transcription results to users and want to highlight parts of the
        transcription that are less likely to change.

        Args:
            text (str): The stabilized transcription text.
        """
        if self.on_realtime_transcription_stabilized:
            if self.is_recording:
                self.on_realtime_transcription_stabilized(text)

    def _on_realtime_transcription_update(self, text):
        """
        Callback method invoked when there's an update in the real-time
        transcription.

        This method is called internally whenever there's a change in the
        transcription text, notifying any registered external listener about
        the update if recording is still ongoing. This provides a mechanism
        for applications to receive and possibly display live transcription
        updates, which could be partial and still subject to change.

        Args:
            text (str): The updated transcription text.
        """
        if self.on_realtime_transcription_update:
            if self.is_recording:
                self.on_realtime_transcription_update(text)

    def __enter__(self):
        """
        Method to setup the context manager protocol.

        This enables the instance to be used in a `with` statement, ensuring
        proper resource management. When the `with` block is entered, this
        method is automatically called.

        Returns:
            self: The current instance of the class.
        """
        return self

    def __exit__(self, exc_type, exc_value, trace_back):
        """
        Method to define behavior when the context manager protocol exits.

        This is called when exiting the `with` block and ensures that any
        necessary cleanup or resource release processes are executed, such as
        shutting down the system properly.

        Args:
            exc_type (Exception or None): The type of the exception that
              caused the context to be exited, if any.
            exc_value (Exception or None): The exception instance that caused
              the context to be exited, if any.
            traceback (Traceback or None): The traceback corresponding to the
              exception, if any.
        """
        self.shutdown()
