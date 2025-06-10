from sqlalchemy.orm import Session
from app.db.models.cours import Cours
from typing import Optional
from app.core.database import Base
from fastapi import HTTPException

class CoursService:
    def __init__(self, db: Session):
        self.db = db

    def create_cours(
        self,
        module: str,
        name: str,
        transcription: str,
        summary: str,
        professeur_id: int
    ) -> Cours:
        cours = Cours(
            module=module,
            name=name,
            transcription=transcription,
            summary=summary,
            professeur_id=professeur_id
        )
        self.db.add(cours)
        self.db.commit()
        self.db.refresh(cours)
        return cours

    def get_cours_by_id(self, cours_id: int) -> Optional[Cours]:
        return self.db.query(Cours).filter(Cours.id == cours_id).first()

    def get_cours_by_professeur(self, professeur_id: int) -> list[Cours]:
        return self.db.query(Cours).filter(Cours.professeur_id == professeur_id).all()

    def update_cours(self, cours_id: int, cours_update: dict, professeur_id: int) -> Cours:
        cours = self.db.query(Cours).filter(
            Cours.id == cours_id,
            Cours.professeur_id == professeur_id
        ).first()
        
        if not cours:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Update only the fields that are provided
        if cours_update.get('name') is not None:
            cours.name = cours_update['name']
        if cours_update.get('module') is not None:
            cours.module = cours_update['module']
        if cours_update.get('transcription') is not None:
            cours.transcription = cours_update['transcription']
        if cours_update.get('summary') is not None:
            cours.summary = cours_update['summary']
        
        try:
            self.db.commit()
            self.db.refresh(cours)
            return cours
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    def delete_cours(self, cours_id: int, professeur_id: int) -> None:
        cours = self.db.query(Cours).filter(
            Cours.id == cours_id,
            Cours.professeur_id == professeur_id
        ).first()
        
        if not cours:
            raise HTTPException(status_code=404, detail="Course not found")
        
        try:
            self.db.delete(cours)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e)) 