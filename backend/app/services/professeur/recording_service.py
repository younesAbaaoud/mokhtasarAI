import pyaudio
import wave
import threading
import time
import os
from datetime import datetime
import json
from pathlib import Path
import keyboard
import asyncio
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
import tempfile
import shutil
import logging
import numpy as np


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioRecorder:
    def __init__(self):
        try:
            logger.info("Initializing AudioRecorder")
            self.chunk = 1024
            self.sample_format = pyaudio.paInt16
            self.channels = 2
            self.fs = 44100
            self.frames = []
            self.recording = False
            self.audio = pyaudio.PyAudio()
            
            # Initialize recordings directory
            self.recordings_dir = os.path.join(os.path.expanduser("~"), "Documents", "recordings")
            os.makedirs(self.recordings_dir, exist_ok=True)
            
            # Initialize or load course counter
            self.counter_file = os.path.join(self.recordings_dir, "course_counter.json")
            self.course_counter = self._load_course_counter()
            
            # Find stereo mix and microphone devices
            self.stereo_mix_device = self._find_stereo_mix_device()
            self.microphone_device = self._find_microphone_device()
            
            if self.stereo_mix_device is None:
                logger.warning("Stereo Mix device not found. System audio recording may not work.")
                logger.info("To enable system audio recording:")
                logger.info("1. Right-click the speaker icon in the system tray")
                logger.info("2. Select 'Open Sound settings'")
                logger.info("3. Click 'Sound Control Panel'")
                logger.info("4. Go to the 'Recording' tab")
                logger.info("5. Right-click in the device list and enable 'Show Disabled Devices'")
                logger.info("6. Find 'Stereo Mix', right-click and enable it")
            else:
                logger.info(f"Found Stereo Mix device: {self.stereo_mix_device['name']}")
            
            if self.microphone_device is None:
                logger.warning("No microphone device found. Voice recording may not work.")
            else:
                logger.info(f"Found Microphone device: {self.microphone_device['name']}")
            
            # List available audio devices
            logger.info("Available audio devices:")
            for i in range(self.audio.get_device_count()):
                device_info = self.audio.get_device_info_by_index(i)
                logger.info(f"Device {i}: {device_info['name']}")
                if device_info['maxInputChannels'] > 0:  # This is an input device
                    logger.info(f"  Input device found: {device_info['name']}")
                    logger.info(f"  Device index: {i}")
                    logger.info(f"  Input channels: {device_info['maxInputChannels']}")
                    logger.info(f"  Default sample rate: {device_info['defaultSampleRate']}")
            
            self.stream_mix = None
            self.stream_mic = None
            self.record_thread = None
            self.output_filename = None
            self.recording_start_time = None
            logger.info("AudioRecorder initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing AudioRecorder: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error initializing audio recorder: {str(e)}")
        
    def _find_stereo_mix_device(self):
        """Find the Stereo Mix device if available"""
        try:
            for i in range(self.audio.get_device_count()):
                device_info = self.audio.get_device_info_by_index(i)
                if device_info['maxInputChannels'] > 0:  # This is an input device
                    # Look for common names of stereo mix devices
                    if any(name in device_info['name'].lower() for name in ['stereo mix', 'what u hear', 'what you hear', 'loopback']):
                        return {'index': i, 'name': device_info['name']}
            return None
        except Exception as e:
            logger.error(f"Error finding stereo mix device: {str(e)}")
            return None
        
    def _find_microphone_device(self):
        """Find the default microphone device"""
        try:
            default_input = self.audio.get_default_input_device_info()
            if default_input['maxInputChannels'] > 0:
                return {'index': default_input['index'], 'name': default_input['name']}
            return None
        except Exception as e:
            logger.error(f"Error finding microphone device: {str(e)}")
            return None
        
    def _mix_audio_data(self, mix_data, mic_data):
        """Mix two audio streams together"""
        try:
            # Convert bytes to numpy arrays
            mix_array = np.frombuffer(mix_data, dtype=np.int16)
            mic_array = np.frombuffer(mic_data, dtype=np.int16)
            
            # Ensure both arrays are the same length
            min_length = min(len(mix_array), len(mic_array))
            mix_array = mix_array[:min_length]
            mic_array = mic_array[:min_length]
            
            # Mix the audio (simple addition with clipping prevention)
            mixed = np.clip(mix_array + mic_array, -32768, 32767).astype(np.int16)
            
            # Convert back to bytes
            return mixed.tobytes()
        except Exception as e:
            logger.error(f"Error mixing audio: {str(e)}")
            return mix_data  # Return system audio if mixing fails
        
    def _load_course_counter(self):
        """Load or initialize the course counter"""
        try:
            if os.path.exists(self.counter_file):
                with open(self.counter_file, 'r') as f:
                    data = json.load(f)
                    return data.get('counter', 0)
            return 0
        except Exception as e:
            logger.error(f"Error loading course counter: {str(e)}")
            return 0

    def _save_course_counter(self):
        """Save the current course counter"""
        try:
            with open(self.counter_file, 'w') as f:
                json.dump({'counter': self.course_counter}, f)
        except Exception as e:
            logger.error(f"Error saving course counter: {str(e)}")

    def _generate_filename(self):
        """Generate a filename with course number, date, and time"""
        try:
            self.course_counter += 1
            self._save_course_counter()
            
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            filename = f"cours_{self.course_counter}_{timestamp}.wav"
            return os.path.join(self.recordings_dir, filename)
        except Exception as e:
            logger.error(f"Error generating filename: {str(e)}")
            raise

    def force_reset(self):
        """Force reset all recording states regardless of current state"""
        logger.info("Force resetting all recording states")
        try:
            # Stop any ongoing recording
            self.recording = False
            
            # Kill any running threads
            if self.record_thread and self.record_thread.is_alive():
                logger.info("Terminating recording thread")
                # We can't actually kill the thread, but we can set recording to False
                # and wait a short time for it to finish
                self.record_thread.join(timeout=1.0)
            
            # Close all streams
            for stream in [self.stream_mix, self.stream_mic]:
                if stream:
                    try:
                        stream.stop_stream()
                        stream.close()
                    except Exception as e:
                        logger.error(f"Error closing stream during force reset: {str(e)}")
            
            # Reset all state variables
            self.frames = []
            self.stream_mix = None
            self.stream_mic = None
            self.record_thread = None
            self.output_filename = None
            self.recording_start_time = None
            self.recording = False
            
            # Reinitialize audio system
            try:
                if self.audio:
                    self.audio.terminate()
                self.audio = pyaudio.PyAudio()
                self.stereo_mix_device = self._find_stereo_mix_device()
                self.microphone_device = self._find_microphone_device()
            except Exception as e:
                logger.error(f"Error reinitializing audio during force reset: {str(e)}")
                # Don't raise the exception, just log it
            
            logger.info("Force reset completed")
            return True
        except Exception as e:
            logger.error(f"Error during force reset: {str(e)}")
            # Even if there's an error, try to reset the recording state
            self.recording = False
            return False

    def start_recording(self):
        """Start recording audio from microphone"""
        try:
            logger.info("Starting recording")
            
            # Force reset before starting new recording
            self.force_reset()
            
            # Check if we have any recording devices available
            if not self.stereo_mix_device and not self.microphone_device:
                error_msg = "No audio recording devices available. Please ensure either Stereo Mix or a microphone is enabled."
                logger.error(error_msg)
                raise HTTPException(
                    status_code=400,
                    detail=error_msg
                )
            
            # Check if audio system is initialized
            if not self.audio:
                error_msg = "Audio system not initialized. Please try again."
                logger.error(error_msg)
                raise HTTPException(
                    status_code=500,
                    detail=error_msg
                )
            
            # Generate filename first to ensure we have a valid path
            try:
                self.output_filename = self._generate_filename()
                logger.info(f"Output file will be: {self.output_filename}")
            except Exception as e:
                logger.error(f"Error generating filename: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to initialize recording: Could not create output file"
                )
            
            # Initialize recording state
            self.frames = []
            self.recording = True
            self.recording_start_time = time.time()
            
            # Start recording in a separate thread
            try:
                self.record_thread = threading.Thread(target=self._record_audio)
                self.record_thread.daemon = True  # Make thread daemon so it exits when main thread exits
                self.record_thread.start()
                logger.info("Recording thread started")
            except Exception as e:
                logger.error(f"Error starting recording thread: {str(e)}")
                self.force_reset()  # Use force reset instead of just setting recording to False
                raise HTTPException(
                    status_code=500,
                    detail="Failed to start recording thread. Please try again."
                )
            
            # Start keyboard listener in background
            try:
                keyboard_thread = threading.Thread(target=self._start_keyboard_listener)
                keyboard_thread.daemon = True
                keyboard_thread.start()
            except Exception as e:
                logger.error(f"Error starting keyboard listener: {str(e)}")
                # Don't raise exception for keyboard listener as it's not critical
            
            # Return success immediately with available device info
            return {
                "message": "Recording started successfully",
                "start_time": self.recording_start_time,
                "devices": {
                    "stereo_mix": self.stereo_mix_device["name"] if self.stereo_mix_device else None,
                    "microphone": self.microphone_device["name"] if self.microphone_device else None
                }
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error starting recording: {str(e)}")
            logger.error("Detailed error info:", exc_info=True)
            self.force_reset()  # Use force reset instead of just setting recording to False
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while starting the recording. Please try again."
            )
    
    def _record_audio(self):
        """Internal method to record audio from both sources"""
        try:
            logger.info("Opening audio streams")
            streams_opened = False
            
            # Open Stereo Mix stream
            if self.stereo_mix_device:
                try:
                    self.stream_mix = self.audio.open(
                        format=self.sample_format,
                        channels=self.channels,
                        rate=self.fs,
                        frames_per_buffer=self.chunk,
                        input=True,
                        input_device_index=self.stereo_mix_device['index']
                    )
                    logger.info("Stereo Mix stream opened successfully")
                    streams_opened = True
                except Exception as e:
                    logger.error(f"Error opening Stereo Mix stream: {str(e)}")
                    self.stream_mix = None
            
            # Open Microphone stream
            if self.microphone_device:
                try:
                    self.stream_mic = self.audio.open(
                format=self.sample_format,
                channels=self.channels,
                rate=self.fs,
                frames_per_buffer=self.chunk,
                        input=True,
                        input_device_index=self.microphone_device['index']
                    )
                    logger.info("Microphone stream opened successfully")
                    streams_opened = True
                except Exception as e:
                    logger.error(f"Error opening Microphone stream: {str(e)}")
                    self.stream_mic = None
            
            if not streams_opened:
                error_msg = "Failed to open any audio streams. Please check your audio devices."
                logger.error(error_msg)
                self.recording = False
                raise Exception(error_msg)
            
            logger.info("Starting audio capture loop")
            while self.recording:
                try:
                    # Read from both streams
                    mix_data = self.stream_mix.read(self.chunk) if self.stream_mix else b'\x00' * self.chunk * 2
                    mic_data = self.stream_mic.read(self.chunk) if self.stream_mic else b'\x00' * self.chunk * 2
                    
                    # Mix the audio
                    mixed_data = self._mix_audio_data(mix_data, mic_data)
                    self.frames.append(mixed_data)
                    
                except Exception as e:
                    logger.error(f"Error reading audio data: {str(e)}")
                    logger.error("Detailed error info:", exc_info=True)
                    self.recording = False
                    break
                
        except Exception as e:
            logger.error(f"Error during recording: {str(e)}")
            logger.error("Detailed error info:", exc_info=True)
            self.recording = False
            raise  # Re-raise the exception to be caught by start_recording
        finally:
            # Close both streams
            for stream in [self.stream_mix, self.stream_mic]:
                if stream:
                    try:
                        logger.info("Closing audio stream")
                        stream.stop_stream()
                        stream.close()
                    except Exception as e:
                        logger.error(f"Error closing stream: {str(e)}")
                        logger.error("Detailed error info:", exc_info=True)
    
    def _start_keyboard_listener(self):
        """Start listening for ESC key to stop recording"""
        try:
            def on_escape():
                if self.recording:
                    self.stop_recording()
        
                keyboard.add_hotkey('esc', on_escape)
                logger.info("Keyboard listener started")
        except Exception as e:
            logger.error(f"Error starting keyboard listener: {str(e)}")
            # Don't raise the exception as this is a background task
    
    def stop_recording(self):
        """Stop recording and save the audio file"""
        try:
            logger.info("Stopping recording")
            if not self.recording:
                logger.warning("No recording in progress")
                return {
                    "message": "No recording was in progress",
                    "filename": self.output_filename,
                    "duration": 0,
                    "file_size": 0
                }
            
            # Set recording to False first to stop the recording loop
            self.recording = False
            
            # Wait for recording thread to finish
            if self.record_thread and self.record_thread.is_alive():
                logger.info("Waiting for recording thread to finish")
                self.record_thread.join(timeout=5.0)  # Add timeout to prevent hanging
            
            # Save the recorded audio if we have frames
            if not self.frames:
                logger.warning("No audio frames to save")
                return {
                    "message": "Recording stopped but no audio was captured",
                    "filename": None,
                    "duration": 0,
                    "file_size": 0
                }

            try:
                # Ensure output directory exists
                os.makedirs(os.path.dirname(self.output_filename), exist_ok=True)
                
                # Save the file
                self._save_audio_file()
                
                # Verify the file was created and has content
                if not os.path.exists(self.output_filename):
                    raise Exception("File was not created")
                
                file_size = os.path.getsize(self.output_filename)
                if file_size == 0:
                    raise Exception("File was created but is empty")
                
                duration = time.time() - self.recording_start_time if self.recording_start_time else 0
                logger.info(f"Recording stopped successfully. Duration: {duration:.2f} seconds, File size: {file_size} bytes")
                
                return {
                    "message": "Recording stopped successfully",
                    "filename": self.output_filename,
                    "duration": round(duration, 2),
                    "file_size": file_size
                }
            except Exception as save_error:
                logger.error(f"Error saving audio file: {str(save_error)}")
                # Don't raise here, just return an error response
                return {
                    "message": "Error saving audio file",
                    "filename": None,
                    "duration": 0,
                    "file_size": 0,
                    "error": str(save_error)
                }
                
        except Exception as e:
            logger.error(f"Error stopping recording: {str(e)}")
            logger.error("Detailed error info:", exc_info=True)
            # Reset recording state
            self.recording = False
            self.frames = []
            self.output_filename = None
            self.recording_start_time = None
            raise HTTPException(
                status_code=500,
                detail=f"Error stopping recording: {str(e)}"
            )
        finally:
            # Always clean up resources
            try:
                if self.stream_mix:
                    self.stream_mix.stop_stream()
                    self.stream_mix.close()
                if self.stream_mic:
                    self.stream_mic.stop_stream()
                    self.stream_mic.close()
                self.stream_mix = None
                self.stream_mic = None
            except Exception as cleanup_error:
                logger.error(f"Error cleaning up streams: {str(cleanup_error)}")
            
            # Reset recording state
            self.recording = False
            self.record_thread = None
    
    def _save_audio_file(self):
        """Save recorded frames to WAV file"""
        try:
            logger.info("Saving audio file")
            if not self.frames:
                logger.error("No audio data to save")
                raise Exception("No audio data to save")
            
            with wave.open(self.output_filename, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(self.audio.get_sample_size(self.sample_format))
                wf.setframerate(self.fs)
                wf.writeframes(b''.join(self.frames))
                logger.info(f"Audio file saved successfully: {self.output_filename}")
        except Exception as e:
            logger.error(f"Error saving audio file: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error saving audio file: {str(e)}")
    
    def get_recording_status(self):
        """Get current recording status"""
        try:
            duration = time.time() - self.recording_start_time if self.recording_start_time and self.recording else 0
            status = {
                "recording": self.recording,
                "duration": round(duration, 2),
                    "filename": self.output_filename,
                    "course_number": self.course_counter if self.recording else None,
                    "recordings_dir": self.recordings_dir
            }
            logger.debug(f"Recording status: {status}")
            return status
        except Exception as e:
            logger.error(f"Error getting recording status: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error getting recording status: {str(e)}")
    
    def cleanup(self):
        """Clean up resources"""
        try:
            logger.info("Starting cleanup process")
            success = self.force_reset()  # Use force reset for cleanup
            
            if success:
                logger.info("Cleanup completed successfully")
                return {
                    "message": "Recorder cleaned up successfully",
                    "recording": False,
                    "devices": {
                        "stereo_mix": self.stereo_mix_device["name"] if self.stereo_mix_device else None,
                        "microphone": self.microphone_device["name"] if self.microphone_device else None
                    }
                }
            else:
                logger.warning("Cleanup completed with some errors")
                # Even if cleanup had some errors, return success as long as recording is False
                return {
                    "message": "Recorder cleaned up with some non-critical errors",
                    "recording": False,
                    "devices": {
                        "stereo_mix": self.stereo_mix_device["name"] if self.stereo_mix_device else None,
                        "microphone": self.microphone_device["name"] if self.microphone_device else None
                    }
                }
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
            # Even if there's an error, try to reset the recording state
            self.force_reset()  # Use force reset as a last resort
            raise HTTPException(status_code=500, detail=f"Error during cleanup: {str(e)}")

# Global recorder instance
recorder = AudioRecorder()
