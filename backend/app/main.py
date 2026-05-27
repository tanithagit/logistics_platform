from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import auth, users, vehicles

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

# All routers registered here
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(vehicles.router)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Logistics Platform API is running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}