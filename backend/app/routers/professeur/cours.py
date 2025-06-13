from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.services.professeur.cours_service import CoursService
from app.utils.protectRoute import get_current_user
from app.db.models.cours import Cours
from app.db.models.module import Module
from app.db.schemas.user import UserOutput
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ModuleInfo(BaseModel):
    id: int
    name: str
    abreviation: str

    class Config:
        from_attributes = True

class CoursCreate(BaseModel):
    module_id: int
    name: str
    transcription: str
    summary: str

class CoursResponse(BaseModel):
    id: int
    module_id: int
    name: str
    transcription: str
    summary: str
    professeur_id: int
    time_inserted: datetime
    module: ModuleInfo

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CoursUpdate(BaseModel):
    module_id: Optional[int]
    name: Optional[str]
    transcription: Optional[str]
    summary: Optional[str]

@router.post("/cours", response_model=CoursResponse)
async def create_cours(
    cours: CoursCreate,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can create courses")
    
    cours_service = CoursService(db)
    try:
        new_cours = cours_service.create_cours(
            module_id=cours.module_id,
            name=cours.name,
            transcription=cours.transcription,
            summary=cours.summary,
            professeur_id=current_user.id
        )
        return new_cours
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cours", response_model=list[CoursResponse])
async def get_professeur_cours(
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can view their courses")
    
    cours_service = CoursService(db)
    try:
        # Join with Module table to get module information
        cours = db.query(Cours).options(joinedload(Cours.module)).filter(Cours.professeur_id == current_user.id).all()
        return cours
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/cours/{cours_id}", response_model=CoursResponse)
async def update_cours(
    cours_id: int,
    cours_update: CoursUpdate,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can update courses")
    
    logger.info(f"Attempting to update course {cours_id} for professor {current_user.id}")
    logger.info(f"Update data: {cours_update.dict(exclude_unset=True)}")  # Only include set fields
    
    cours_service = CoursService(db)
    try:
        # Use exclude_unset=True to only include fields that were actually provided
        updated_cours = cours_service.update_cours(
            cours_id, 
            cours_update.dict(exclude_unset=True), 
            current_user.id
        )
        logger.info(f"Successfully updated course {cours_id}")
        return updated_cours
    except Exception as e:
        logger.error(f"Error updating course {cours_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cours/{cours_id}")
async def delete_cours(
    cours_id: int,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can delete courses")
    
    logger.info(f"Attempting to delete course {cours_id} for professor {current_user.id}")
    
    cours_service = CoursService(db)
    try:
        cours_service.delete_cours(cours_id, current_user.id)
        logger.info(f"Successfully deleted course {cours_id}")
        return {"message": "Course deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting course {cours_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))





