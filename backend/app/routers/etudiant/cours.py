from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.etudiant.cours_service import CoursService
from app.utils.protectRoute import get_current_user
from app.db.schemas.user import UserOutput
from typing import Optional
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/cours")
async def get_cours(
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user),
    module: Optional[str] = Query(None, description="Filter by module name or abbreviation"),
    search: Optional[str] = Query(None, description="Search in course name, module, or professor"),
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    professeur: Optional[str] = Query(None, description="Filter by professor username")
):
    if current_user.role != "ETUDIANT":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    cours_service = CoursService(db)
    try:
        cours = cours_service.get_all_cours(
            module=module,
            search=search,
            date=date,
            professeur=professeur
        )
        return cours
    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/modules")
async def get_modules(
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    """Get all available modules for filtering"""
    if current_user.role != "ETUDIANT":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    cours_service = CoursService(db)
    try:
        modules = cours_service.get_available_modules()
        return modules
    except Exception as e:
        logger.error(f"Error fetching modules: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))