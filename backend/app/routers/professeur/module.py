from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.professeur.module_service import ModuleService
from app.utils.protectRoute import get_current_user
from app.db.schemas.user import UserOutput
from typing import List
from pydantic import BaseModel
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ModuleCreate(BaseModel):
    name: str
    abreviation: str
    description: str | None = None

class ModuleResponse(BaseModel):
    id: int
    name: str
    abreviation: str
    description: str | None = None
    time_inserted: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ModuleUpdate(BaseModel):
    name: str | None = None
    abreviation: str | None = None
    description: str | None = None

@router.get("/modules", response_model=List[ModuleResponse])
def get_modules(
    search: str = None,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can view modules")
    
    module_service = ModuleService(db)
    return module_service.get_all_modules(search)

@router.get("/modules/{module_id}", response_model=ModuleResponse)
def get_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can view modules")
    
    module_service = ModuleService(db)
    module = module_service.get_module_by_id(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

@router.post("/modules", response_model=ModuleResponse)
def create_module(
    module: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can create modules")
    
    module_service = ModuleService(db)
    return module_service.create_module(module)

@router.put("/modules/{module_id}", response_model=ModuleResponse)
def update_module(
    module_id: int,
    module: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can update modules")
    
    module_service = ModuleService(db)
    updated_module = module_service.update_module(module_id, module)
    if not updated_module:
        raise HTTPException(status_code=404, detail="Module not found")
    return updated_module

@router.delete("/modules/{module_id}")
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "PROFESSEUR":
        raise HTTPException(status_code=403, detail="Only professors can delete modules")
    
    module_service = ModuleService(db)
    if not module_service.delete_module(module_id):
        raise HTTPException(status_code=404, detail="Module not found")
    return {"message": "Module deleted successfully"} 