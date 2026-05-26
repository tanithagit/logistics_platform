from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Logistics & Fleet Management Platform",
    description="A multi-tenant logistics SaaS platform",
    version="1.0.0"
)

# CORS — allows the React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Logistics Platform API is running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}