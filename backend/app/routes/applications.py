from fastapi import APIRouter, Depends, Header, HTTPException
from app.db import SessionLocal
from app.models import Application
from app.auth import decode_token

router = APIRouter(prefix="/applications", tags=["Applications"])

def get_user_email(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    token = authorization.split(" ")[1]
    email = decode_token(token)

    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    return email


@router.post("/")
def save_application(app_data: dict, email: str = Depends(get_user_email)):
    db = SessionLocal()

    application = Application(
        **app_data,
        user_email=email
    )

    db.add(application)
    db.commit()
    db.close()

    return {"message": "saved"}


@router.get("/")
def get_applications(email: str = Depends(get_user_email)):
    db = SessionLocal()
    apps = db.query(Application).filter(Application.user_email == email).all()
    db.close()
    return apps