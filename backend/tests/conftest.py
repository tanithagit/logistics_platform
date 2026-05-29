import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

TEST_DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/logistics_test_db"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

# ─── Helper functions (not fixtures) ──────────────────

def create_org_and_admin(client, suffix=""):
    """Create organization and return admin token"""
    client.post("/auth/register", json={
        "org_name": f"Test Org {suffix}",
        "org_email": f"org{suffix}@test.com",
        "org_phone": "9999999999",
        "org_address": "Test City",
        "full_name": f"Admin {suffix}",
        "email": f"admin{suffix}@test.com",
        "password": "test123",
        "phone": "9999999999"
    })
    login = client.post("/auth/login", json={
        "email": f"admin{suffix}@test.com",
        "password": "test123"
    })
    return login.json()["access_token"]

def create_driver(client, admin_headers, suffix=""):
    """Create driver and return user + token"""
    user = client.post("/users/", json={
        "full_name": f"Driver {suffix}",
        "email": f"driver{suffix}@test.com",
        "password": "test123",
        "phone": "8888888888",
        "role": "driver"
    }, headers=admin_headers).json()

    token = client.post("/auth/login", json={
        "email": f"driver{suffix}@test.com",
        "password": "test123"
    }).json()["access_token"]

    return user, {"Authorization": f"Bearer {token}"}

def create_customer(client, admin_headers, suffix=""):
    """Create customer and return user + token"""
    user = client.post("/users/", json={
        "full_name": f"Customer {suffix}",
        "email": f"customer{suffix}@test.com",
        "password": "test123",
        "phone": "7777777777",
        "role": "customer"
    }, headers=admin_headers).json()

    token = client.post("/auth/login", json={
        "email": f"customer{suffix}@test.com",
        "password": "test123"
    }).json()["access_token"]

    return user, {"Authorization": f"Bearer {token}"}

def create_vehicle(client, admin_headers, suffix=""):
    """Create and return a vehicle"""
    return client.post("/vehicles/", json={
        "vehicle_number": f"TEST-{suffix}",
        "type": "truck",
        "capacity": 1000,
        "status": "active"
    }, headers=admin_headers).json()

def create_delivery(client, customer_headers):
    """Create and return a delivery"""
    return client.post("/deliveries/", json={
        "pickup_address": "123 Test Pickup St",
        "delivery_address": "456 Test Delivery Ave",
        "notes": "Test delivery"
    }, headers=customer_headers).json()