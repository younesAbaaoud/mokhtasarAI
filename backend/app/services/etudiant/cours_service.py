from sqlalchemy.orm import Session
from app.db.models.cours import Cours
from app.db.models.user import User
from app.db.models.module import Module
from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy import or_

class CoursService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_cours(
        self,
        module: Optional[str] = None,
        search: Optional[str] = None,
        date: Optional[str] = None,
        professeur: Optional[str] = None
    ) -> List[dict]:
        query = self.db.query(
            Cours,
            User.username.label('professeur_username'),
            Module.name.label('module_name'),
            Module.abreviation.label('module_abreviation'),
            Module.description.label('module_description')
        ).join(
            User,
            Cours.professeur_id == User.id
        ).join(
            Module,
            Cours.module_id == Module.id
        )

        # Apply filters
        if module:
            # Filter by module name or abbreviation
            query = query.filter(
                or_(
                    Module.name.ilike(f"%{module}%"),
                    Module.abreviation.ilike(f"%{module}%")
                )
            )

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Cours.name.ilike(search_term),
                    Module.name.ilike(search_term),
                    Module.abreviation.ilike(search_term),
                    User.username.ilike(search_term)
                )
            )

        if date:
            try:
                filter_date = datetime.strptime(date, "%Y-%m-%d").date()
                query = query.filter(Cours.time_inserted >= filter_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

        if professeur:
            professeur_term = f"%{professeur}%"
            query = query.filter(User.username.ilike(professeur_term))

        # Execute query and format results
        results = query.all()
        formatted_results = []

        for cours, professeur_username, module_name, module_abreviation, module_description in results:
            formatted_results.append({
                "id": cours.id,
                "name": cours.name,
                "transcription": cours.transcription,
                "summary": cours.summary,
                "date": cours.time_inserted,
                "professeur": professeur_username,
                "module": {
                    "id": cours.module_id,
                    "name": module_name,
                    "abreviation": module_abreviation,
                    "description": module_description
                }
            })

        return formatted_results

    def get_available_modules(self) -> List[dict]:
        """Get all available modules for filtering"""
        modules = self.db.query(Module).all()
        return [
            {
                "id": module.id,
                "name": module.name,
                "abreviation": module.abreviation,
                "description": module.description
            }
            for module in modules
        ]