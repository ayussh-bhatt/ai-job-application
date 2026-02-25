from sqlalchemy import Column, Integer, String, ForeignKey
from app.db import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    company = Column(String)
    url = Column(String)
    status = Column(String)
    date = Column(String)

    user_email = Column(String, index=True)  # link to user

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)