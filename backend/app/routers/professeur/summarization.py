from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from ...services.professeur.summarization_service import summarization_service
from ...utils.protectRoute import get_current_user

router = APIRouter()

class SummarizationRequest(BaseModel):
    text: str

@router.post("/summarization")
async def summarize_text(
    request: SummarizationRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        summary = summarization_service.summarize_text(request.text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 