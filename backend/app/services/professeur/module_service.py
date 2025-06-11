from sqlalchemy.orm import Session
from app.db.models.module import Module
from app.db.schemas.module import ModuleCreate, ModuleUpdate
from fastapi import HTTPException
from typing import List, Optional
from sqlalchemy import or_

class ModuleService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_modules(self, search: str = None) -> List[Module]:
        query = self.db.query(Module)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Module.name.ilike(search_term),
                    Module.abreviation.ilike(search_term),
                    Module.description.ilike(search_term)
                )
            )
        return query.all()

    def get_module_by_id(self, module_id: int) -> Optional[Module]:
        return self.db.query(Module).filter(Module.id == module_id).first()

    def create_module(self, module: ModuleCreate) -> Module:
        db_module = Module(**module.dict())
        self.db.add(db_module)
        self.db.commit()
        self.db.refresh(db_module)
        return db_module

    def update_module(self, module_id: int, module: ModuleUpdate) -> Optional[Module]:
        db_module = self.get_module_by_id(module_id)
        if not db_module:
            return None

        update_data = module.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_module, key, value)

        self.db.commit()
        self.db.refresh(db_module)
        return db_module

    def delete_module(self, module_id: int) -> bool:
        db_module = self.get_module_by_id(module_id)
        if not db_module:
            return False

        self.db.delete(db_module)
        self.db.commit()
        return True 