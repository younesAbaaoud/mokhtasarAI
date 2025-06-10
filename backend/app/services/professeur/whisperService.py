import whisper
import tempfile
import os
import time
from fastapi import UploadFile, HTTPException
import subprocess
import shutil

class WhisperSTT:
    def __init__(self, model_size="base"):
        """
        Initialize the Whisper model for speech-to-text.
        
        Args:
            model_size (str): The size of the Whisper model to use. Options include:
                - "tiny"
                - "base"
                - "small"
                - "medium"
                - "large"
        """
        # Check if FFmpeg is installed
        if not shutil.which('ffmpeg'):
            raise HTTPException(
                status_code=500,
                detail="FFmpeg is not installed. Please install FFmpeg using 'choco install ffmpeg'"
            )
            
        self.model = whisper.load_model(model_size)
        
    def transcribe(self, audio_path):
        """
        Transcribe audio to text using Whisper.
        
        Args:
            audio_path (str): Path to the audio file to transcribe
            
        Returns:
            dict: A dictionary containing:
                - text: The transcribed text
                - processing_time: Time taken to process the audio
        """
        start_time = time.time()
        result = self.model.transcribe(audio_path)
        end_time = time.time()
        
        return {
            "text": result["text"],
            "processing_time": end_time - start_time
        }

class WhisperService:
    def __init__(self, model_size="base"):
        # Initialize the WhisperSTT model
        self.stt_model = WhisperSTT(model_size=model_size)
    
    async def transcribe_audio(self, audio_file: UploadFile) -> dict:
        try:
            # Create a temporary file to store the uploaded audio
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_file:
                # Write the uploaded file to the temporary file
                content = await audio_file.read()
                temp_file.write(content)
                temp_file.flush()
                
                # Ensure the file is closed before processing
                temp_file.close()
                
                # Transcribe the audio file using our WhisperSTT model
                result = self.stt_model.transcribe(temp_file.name)
                
                # Clean up the temporary file
                os.unlink(temp_file.name)
                
                return result
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}") 