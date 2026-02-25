from fastapi import APIRouter
from app.db import SessionLocal
from app.models import Application

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/")
def save_application(app_data: dict):
    db = SessionLocal()
    application = Application(**app_data)
    db.add(application)
    db.commit()
    db.close()
    return {"message": "saved"}

@router.get("/")
def get_applications():
    db = SessionLocal()
    apps = db.query(Application).all()
    db.close()
    return apps