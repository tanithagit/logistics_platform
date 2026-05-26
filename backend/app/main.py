from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base

# Import all models so SQLAlchemy knows about them
import app.models

app = FastAPI(
    title="Logistics & Fleet Management Platform",
    description="A multi-tenant logistics SaaS platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This creates all tables in the database on startup
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Logistics Platform API is running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}