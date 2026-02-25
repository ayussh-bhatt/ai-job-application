from sqlalchemy import Column, Integer, String
from app.db import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    company = Column(String)
    url = Column(String)
    status = Column(String)
    date = Column(String)