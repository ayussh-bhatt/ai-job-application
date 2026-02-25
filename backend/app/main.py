from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# load environment variables
load_dotenv()

# import routers
from app.routes import resume, jobs, ai, applications, auth

app = FastAPI(title="AI Job Assistant API")

# CORS (allow frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register routes
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(ai.router)
app.include_router(applications.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "API Running"}