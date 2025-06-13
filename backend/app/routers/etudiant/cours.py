from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.etudiant.cours_service import CoursService
from app.utils.protectRoute import get_current_user
from app.db.schemas.user import UserOutput
from typing import Optional
from datetime import datetime
import logging
import os
from pathlib import Path


from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.etudiant.cours_service import CoursService
from app.utils.protectRoute import get_current_user
from app.db.schemas.user import UserOutput
from typing import Optional
from datetime import datetime
import logging
from fastapi.responses import StreamingResponse
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch



# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Add this function at the top level
def get_next_pdf_counter():
    # Get the backend directory path
    backend_dir = Path(__file__).parent.parent.parent
    counter_file = backend_dir / "pdf_counter.txt"
    
    try:
        if counter_file.exists():
            with open(counter_file, 'r') as f:
                counter = int(f.read().strip())
        else:
            counter = 1
        
        # Increment and save counter
        with open(counter_file, 'w') as f:
            f.write(str(counter + 1))
        
        print(f"Current PDF counter: {counter}")  # Debug log
        return counter
    except Exception as e:
        print(f"Error with PDF counter: {e}")  # Debug log
        return 1

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

@router.get("/cours/pdf/{module_abbr}")
async def generate_module_pdf(
    module_abbr: str,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if current_user.role != "ETUDIANT":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    cours_service = CoursService(db)
    try:
        # Récupérer les cours du module
        cours = cours_service.get_all_cours(module=module_abbr)
        
        if not cours:
            raise HTTPException(status_code=404, detail="No courses found for this module")

        # Créer le PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Style personnalisé pour les titres
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            textColor=colors.HexColor('#133E87')
        )

        # Style pour le contenu
        content_style = ParagraphStyle(
            'CustomContent',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12
        )

        # Style pour le titre principal centré
        centered_title_style = ParagraphStyle(
            'CenteredTitle',
            parent=styles['Heading1'],
            fontSize=18,
            alignment=1,  # 1 = center
            spaceAfter=20,
            textColor=colors.HexColor('#133E87')
        )

        # Titre principal centré
        story.append(Paragraph(f"Résumés - Module {module_abbr}", centered_title_style))
        story.append(Spacer(1, 12))

        # Afficher la date et le professeur une seule fois (prendre le premier cours)
        if cours:
            first_course = cours[0]
            # Date
            if isinstance(first_course["date"], str):
                date_obj = datetime.strptime(first_course["date"], "%Y-%m-%d")
            else:
                date_obj = first_course["date"]
            date_str = date_obj.strftime("%d %B %Y")
            story.append(Paragraph(f"Date : {date_str}", content_style))
            # Professeur
            story.append(Paragraph(f"Professeur : {first_course['professeur']}", content_style))
            story.append(Spacer(1, 20))

        # Ajouter chaque cours (titre + résumé uniquement)
        for course in cours:
            if course["summary"]:
                # Titre du cours
                story.append(Paragraph(f"Cours : {course['name']}", title_style))
                # Résumé (sans le mot 'Résumé:')
                story.append(Paragraph(course["summary"], content_style))
                story.append(Spacer(1, 30))

        # Générer le PDF
        doc.build(story)
        buffer.seek(0)

        # Get counter and format date
        counter = get_next_pdf_counter()
        date_str = datetime.now().strftime("%d-%m-%Y")
        filename = f"notes_{module_abbr}_{counter:03d}_{date_str}.pdf"
        print(f"Generated filename: {filename}")  # Debug log

        # Retourner le PDF
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cours/pdf")
async def generate_selected_pdf(
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    module_abbr = data.get("module_abbr")
    course_ids = data.get("course_ids", [])

    if current_user.role != "ETUDIANT":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    if not module_abbr or not course_ids:
        raise HTTPException(status_code=400, detail="Module et cours requis")

    cours_service = CoursService(db)
    try:
        # Récupérer les cours du module
        cours = cours_service.get_all_cours(module=module_abbr)
        # Filtrer par IDs sélectionnés
        selected = [c for c in cours if c["id"] in course_ids]

        if not selected:
            raise HTTPException(status_code=404, detail="Aucun résumé sélectionné")

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            textColor=colors.HexColor('#133E87')
        )
        content_style = ParagraphStyle(
            'CustomContent',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12
        )
        centered_title_style = ParagraphStyle(
            'CenteredTitle',
            parent=styles['Heading1'],
            fontSize=18,
            alignment=1,
            spaceAfter=20,
            textColor=colors.HexColor('#133E87')
        )

        story.append(Paragraph(f"Résumés - Module {module_abbr}", centered_title_style))
        story.append(Spacer(1, 12))

        if selected:
            first_course = selected[0]
            if isinstance(first_course["date"], str):
                date_obj = datetime.strptime(first_course["date"], "%Y-%m-%d")
            else:
                date_obj = first_course["date"]
            date_str = date_obj.strftime("%d %B %Y")
            story.append(Paragraph(f"Date : {date_str}", content_style))
            story.append(Paragraph(f"Professeur : {first_course['professeur']}", content_style))
            story.append(Spacer(1, 20))

        for course in selected:
            if course["summary"]:
                story.append(Paragraph(f"Cours : {course['name']}", title_style))
                story.append(Paragraph(course["summary"], content_style))
                story.append(Spacer(1, 30))

        doc.build(story)
        buffer.seek(0)

        # Get counter and format date
        counter = get_next_pdf_counter()
        date_str = datetime.now().strftime("%d-%m-%Y")
        filename = f"notes_{module_abbr}_{counter:03d}_{date_str}.pdf"
        print(f"Generated filename: {filename}")  # Debug log

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))