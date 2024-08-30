"""
    Config
"""

import configparser

class Config:
    """
    Config class
    """
    def __init__(self) -> None:
        config = configparser.ConfigParser()
        config.read(['default.ini', 'config.ini'])

        # Computation
        self.compute_type                         = config['configuration']['compute_type']
        self.gpu_device_index                     = int(config['configuration']['gpu_device_index'])
        self.device                               = config['configuration']['device']

        # Transcriptions
        self.model_transcription                  = config['configuration']['model_transcription']
        self.transcription_language               = config['configuration']['transcription_language']

        self.beam_size                            = int(config['configuration']['beam_size'])
        self.beam_size_realtime                   = int(config['configuration']['beam_size_realtime'])

        self.ensure_sentence_starting_uppercase   = config['configuration'].getboolean('ensure_sentence_starting_uppercase')
        self.ensure_sentence_ends_with_period     = config['configuration'].getboolean('ensure_sentence_ends_with_period')

        # Recording/Audio parameters
        self.use_microphone                       = config['configuration'].getboolean('use_microphone')
        self.input_device_index                   = int(config['configuration']['input_device_index'])
        self.allowed_latency_limit                = int(config['configuration']['allowed_latency_limit'])
        self.sample_rate                          = int(config['configuration']['sample_rate'])
        self.buffer_size                          = int(config['configuration']['buffer_size'])
        self.handle_buffer_overflow               = config['configuration'].getboolean('handle_buffer_overflow')

        # Worker
        self.time_sleep                           = float(config['configuration']['time_sleep'])

        # Realtime transcription parameters
        self.enable_realtime_transcription        = config['configuration'].getboolean('enable_realtime_transcription')
        self.realtime_model_type                  = config['configuration']['realtime_model_type']
        self.realtime_processing_pause            = float(config['configuration']['realtime_processing_pause'])

        # Voice activation parameters
        self.silero_sensitivity                   = float(config['configuration']['silero_sensitivity'])
        self.silero_use_onnx                      = config['configuration'].getboolean('silero_use_onnx')
        self.post_speech_silence_duration         = float(config['configuration']['post_speech_silence_duration'])
        self.min_length_of_recording              = float(config['configuration']['min_length_of_recording'])
        self.min_gap_between_recordings           = float(config['configuration']['min_gap_between_recordings'])
        self.pre_recording_buffer_duration        = float(config['configuration']['pre_recording_buffer_duration'])

        # Wake word parameters
        self.wakeword_backend                     = config['configuration']['wakeword_backend']
        self.openwakeword_model_directory         = config['configuration']['openwakeword_model_directory']
        self.openwakeword_models                  = config['configuration']['openwakeword_models']
        self.openwakeword_inference_framework     = config['configuration']['openwakeword_inference_framework']
        self.wake_words                           = config['configuration']['wake_words']
        self.wake_words_sensitivity               = float(config['configuration']['wake_words_sensitivity'])
        self.wake_word_activation_delay           = float(config['configuration']['wake_word_activation_delay'])
        self.wake_word_timeout                    = float(config['configuration']['wake_word_timeout'])
        self.wake_word_buffer_duration            = float(config['configuration']['wake_word_buffer_duration'])

        # Tortoise
        self.tortoise_model_directory             = config['configuration']['tortoise_model_directory']
        self.tortoise_seed                        = int(config['configuration']['tortoise_seed'])
        self.tortoise_voice                       = config['configuration']['tortoise_voice']
        self.tortoise_kv_cache                    = config['configuration'].getboolean('tortoise_kv_cache')
        self.tortoise_half_precision              = config['configuration'].getboolean('tortoise_half_precision')
        self.tortoise_use_deepspeed               = config['configuration'].getboolean('tortoise_use_deepspeed')

        # Misc
        self.spinner                              = config['configuration'].getboolean('spinner')
        self.debug_mode                           = config['configuration'].getboolean('debug_mode')
        self.level                                = config['configuration']['level']
        self.int16_max_abs_value                  = int(config['configuration']['int16_max_abs_value'])
        self.log_file                             = config['configuration']['log_file']

        # Odoo
        self.odoo_base_url                        = config['configuration']['odoo_base_url']
        self.odoo_api_key                         = config['configuration']['odoo_api_key']

        # Odoo
        self.edge_tts_voice                       = config['configuration']['edge_tts_voice']
