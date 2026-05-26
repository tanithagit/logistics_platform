from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()  # reads values from .env file

DATABASE_URL = os.getenv("DATABASE_URL")

# Engine = the connection to the database
engine = create_engine(DATABASE_URL)

# SessionLocal = each request gets its own db session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = all our models will inherit from this
Base = declarative_base()

# Dependency — used in every API endpoint that needs DB access
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        