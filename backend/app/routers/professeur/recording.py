from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, Response
from fastapi.background import BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
import os
from ...services.professeur.recording_service import AudioRecorder
from ...utils.protectRoute import get_current_user
from ...db.schemas.user import UserOutput
import logging
import shutil
import urllib.parse

router = APIRouter()

# Create a global instance of the AudioRecorder
recorder_instance = AudioRecorder()

logger = logging.getLogger(__name__)

def cleanup_temp_file(filepath: str):
    """Clean up temporary file after sending"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Cleaned up temp file: {filepath}")
    except Exception as e:
        logger.error(f"Error cleaning up temp file {filepath}: {str(e)}")

@router.post("/microphone/start-python-recorder")
async def start_python_recorder(current_user: UserOutput = Depends(get_current_user)):
    """Start Python-based audio recording"""
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can start recording")
    try:
        result = recorder_instance.start_recording()
        return result
    except HTTPException as he:
        # Re-raise HTTP exceptions as they are already properly formatted
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in start_python_recorder: {str(e)}")
        logger.error("Detailed error info:", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while starting the recording. Please try again."
        )

@router.post("/microphone/stop-python-recorder")
async def stop_python_recorder(current_user: UserOutput = Depends(get_current_user)):
    """Stop Python-based audio recording"""
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can stop recording")
    try:
        result = recorder_instance.stop_recording()
        return result
    except HTTPException as he:
        # Re-raise HTTP exceptions as they are already properly formatted
        raise he
    except Exception as e:
        logger.error(f"Error stopping recording: {str(e)}")
        logger.error("Detailed error info:", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error stopping recording: {str(e)}"
        )

@router.get("/microphone/recording-status")
async def get_recording_status(current_user: UserOutput = Depends(get_current_user)):
    """Get current recording status"""
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can check recording status")
    try:
        return recorder_instance.get_recording_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/microphone/download-recording")
async def download_recording(
    background_tasks: BackgroundTasks,
    current_user: UserOutput = Depends(get_current_user)
):
    """Download the latest recorded file"""
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can download recordings")
    try:
        if not recorder_instance.output_filename or not os.path.exists(recorder_instance.output_filename):
            logger.error("No recording file found")
            raise HTTPException(status_code=404, detail="No recording file found")
        
        # Get the base filename from the full path
        filename = os.path.basename(recorder_instance.output_filename)
        logger.info(f"Preparing to send file: {filename}")
        logger.info(f"Full path: {recorder_instance.output_filename}")
        
        # URL encode the filename for the header
        encoded_filename = urllib.parse.quote(filename)
        
        # Create headers with proper encoding for the filename
        headers = {
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
            "Access-Control-Expose-Headers": "Content-Disposition, X-Filename",
            "X-Filename": filename,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Filename",
            "Access-Control-Allow-Credentials": "true"
        }
        logger.info(f"Setting headers: {headers}")
        
        # Create a copy of the file to prevent cleanup issues
        temp_dir = os.path.join(os.path.expanduser("~"), "Documents", "recordings", "temp")
        os.makedirs(temp_dir, exist_ok=True)
        temp_file = os.path.join(temp_dir, filename)
        
        try:
            # Copy the file to temp directory
            shutil.copy2(recorder_instance.output_filename, temp_file)
            logger.info(f"File copied to temp location: {temp_file}")
            
            # Add cleanup task
            background_tasks.add_task(cleanup_temp_file, temp_file)
            
            # Create response with headers
            response = FileResponse(
                temp_file,
                media_type="audio/wav",
                filename=filename,
                headers=headers
            )
            
            # Ensure headers are set
            for key, value in headers.items():
                response.headers[key] = value
            
            return response
            
        except Exception as copy_error:
            logger.error(f"Error copying file: {str(copy_error)}")
            raise HTTPException(status_code=500, detail="Error preparing file for download")
            
    except Exception as e:
        logger.error(f"Error downloading recording: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/microphone/cleanup")
async def cleanup_recorder(current_user: UserOutput = Depends(get_current_user)):
    """Cleanup recorder resources"""
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can cleanup recordings")
    try:
        recorder_instance.cleanup()
        return {"message": "Recorder cleaned up successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))