from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from models import Lead
from schemas import ContactIn, ContactOut

router = APIRouter()


@router.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@router.post("/contact", response_model=ContactOut, status_code=201)
def create_contact(payload: ContactIn, db: Session = Depends(get_db)):
    lead = Lead(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        service=payload.service,
        message=payload.message,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return ContactOut(id=lead.id)
