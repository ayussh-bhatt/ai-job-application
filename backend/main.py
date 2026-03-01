"""Entry point for uvicorn. Run from backend/: uvicorn main:app --reload"""
from app.main import app

__all__ = ["app"]
