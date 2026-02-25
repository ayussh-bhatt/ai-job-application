from fastapi import FastAPI
from app.routes import resume, jobs
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Job Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(jobs.router)

@app.get("/")
def root():
    return {"message": "API Running"}