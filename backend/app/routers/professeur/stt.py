from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.services.professeur.whisperService import WhisperService
from app.utils.protectRoute import get_current_user
from app.db.schemas.user import UserOutput

sttRouter = APIRouter()
whisper_service = WhisperService(model_size="base")  # Using base model for better quality

@sttRouter.post("/transcribe")
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    current_user: UserOutput = Depends(get_current_user)
):
    """
    Transcribe audio file to text using Whisper
    
    Returns:
        dict: A dictionary containing:
            - text: The transcribed text
            - processing_time: Time taken to process the audio in seconds
    """
    if not audio_file.filename:
        raise HTTPException(status_code=400, detail="No audio file provided")
    
    # Check if the file is an audio file
    if not audio_file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Transcribe the audio
    result = await whisper_service.transcribe_audio(audio_file)
    
    return {
        "transcription": result["text"],
        "processing_time": result["processing_time"]
    } 