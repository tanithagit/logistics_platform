# 🚚 Logistics & Fleet Management Platform

A full-stack multi-tenant SaaS platform for managing delivery operations,
fleet tracking, and driver workflows.

---

## 🏗️ Architecture Overview

┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Admin   │  │  Driver  │  │    Customer      │  │
│  │Dashboard │  │Dashboard │  │   Dashboard      │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────┬───────────────────────────┘
│ HTTP / WebSocket
┌─────────────────────────▼───────────────────────────┐
│                  Backend (FastAPI)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Routers │  │ Services │  │    WebSockets     │  │
│  │ (Routes) │  │(Business │  │  (Live Tracking)  │  │
│  │          │  │  Logic)  │  │                   │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────┬───────────────────────────┘
│ SQLAlchemy ORM
┌─────────────────────────▼───────────────────────────┐
│              PostgreSQL Database                     │
│  organizations │ users │ vehicles │ deliveries       │
│  delivery_tracking │ payments                        │
└─────────────────────────────────────────────────────┘
---

## 🧩 System Roles

| Role | Permissions |
|------|------------|
| **Admin** | Manage fleet, drivers, vehicles, view all deliveries |
| **Driver** | View assigned deliveries, update status, send location |
| **Customer** | Create delivery requests, track shipment, make payment |

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — Modern Python web framework
- **PostgreSQL** — Primary database
- **SQLAlchemy** — ORM for database operations
- **Alembic** — Database migrations
- **JWT** — Authentication tokens
- **WebSockets** — Real-time location tracking
- **Passlib + bcrypt** — Password hashing

### Frontend
- **React + Vite** — Frontend framework
- **Tailwind CSS** — Utility-first styling
- **React Router** — Client-side routing
- **Axios** — HTTP client
- **Lucide React** — Icon library
- **React Hot Toast** — Notifications

---

## 📦 Project Structure

logistics-platform/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # App settings
│   │   │   ├── database.py        # DB connection
│   │   │   ├── security.py        # JWT & password hashing
│   │   │   ├── dependencies.py    # Auth guards
│   │   │   └── websocket_manager.py # WebSocket connections
│   │   ├── models/
│   │   │   ├── organization.py    # Organization table
│   │   │   ├── user.py            # User table
│   │   │   ├── vehicle.py         # Vehicle table
│   │   │   ├── delivery.py        # Delivery table
│   │   │   ├── tracking.py        # GPS tracking table
│   │   │   └── payment.py         # Payment table
│   │   ├── schemas/
│   │   │   ├── auth.py            # Auth schemas
│   │   │   ├── user.py            # User schemas
│   │   │   ├── vehicle.py         # Vehicle schemas
│   │   │   ├── delivery.py        # Delivery schemas
│   │   │   ├── payment.py         # Payment schemas
│   │   │   └── dashboard.py       # Dashboard schemas
│   │   ├── services/
│   │   │   ├── auth_service.py    # Auth business logic
│   │   │   ├── user_service.py    # User business logic
│   │   │   ├── vehicle_service.py # Vehicle business logic
│   │   │   ├── delivery_service.py# Delivery business logic
│   │   │   ├── payment_service.py # Payment business logic
│   │   │   └── dashboard_service.py# Dashboard stats
│   │   ├── routers/
│   │   │   ├── auth.py            # Auth endpoints
│   │   │   ├── users.py           # User endpoints
│   │   │   ├── vehicles.py        # Vehicle endpoints
│   │   │   ├── deliveries.py      # Delivery endpoints
│   │   │   ├── dashboard.py       # Dashboard endpoints
│   │   │   └── websockets.py      # WebSocket endpoint
│   │   └── main.py                # App entry point
│   ├── tests/
│   │   ├── conftest.py            # Test configuration
│   │   ├── test_auth.py           # Auth tests
│   │   ├── test_roles.py          # Role-based access tests
│   │   ├── test_delivery.py       # Delivery workflow tests
│   │   ├── test_payment.py        # Payment tests
│   │   └── test_tracking.py       # Tracking tests
│   ├── .env.example               # Environment template
│   └── requirements.txt           # Python dependencies
│
└── frontend/
└── src/
├── context/
│   └── AuthContext.jsx    # Global auth state
├── services/
│   └── api.js             # API call functions
├── components/
│   └── common/            # Reusable components
├── pages/
│   ├── auth/              # Login, Register
│   ├── admin/             # Admin dashboard
│   ├── driver/            # Driver dashboard
│   └── customer/          # Customer dashboard
└── App.jsx                # Routing setup

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/logistics-platform.git
cd logistics-platform
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

```sql
-- Run in PostgreSQL
CREATE DATABASE logistics_db;
```

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`
API Docs at: `http://localhost:8000/docs`

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔐 Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/logistics_db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🚚 Delivery Lifecycle

### Status Transition Rules:


## 📍 Tracking Implementation

### How it works:

### WebSocket Connection:

```javascript
// Connect to live tracking
const ws = new WebSocket('ws://localhost:8000/ws/tracking/{delivery_id}')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // data.type = "location_update"
  // data.latitude, data.longitude
  // data.status, data.address
}
```

### Tracking API:

---

## 🔌 API Reference

### Authentication

### Users (Admin only)

### Vehicles (Admin only)

### Deliveries

### Dashboards

### WebSocket

---

## 🧪 Running Tests

```bash
cd backend

# Create test database
# In PostgreSQL: CREATE DATABASE logistics_test_db;

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_delivery.py -v

# Run with coverage
pytest tests/ -v --tb=short
```

### Test Coverage:

---

## 🏢 Multi-Tenant Architecture

Each organization's data is completely isolated:

```python
# Every query filters by organization_id
deliveries = db.query(Delivery).filter(
    Delivery.organization_id == current_user.organization_id
).all()
```

- Company A cannot see Company B's drivers
- Company A cannot see Company B's deliveries
- Each organization manages their own fleet

---

## 👥 Demo Credentials

After registering your organization, create users via:
- Admin panel UI
- Or POST `/users/` API endpoint

Default roles:
- `admin` — Full access to organization
- `driver` — Can update assigned deliveries
- `customer` — Can create and track deliveries

---

## 🔥 Bonus Features Implemented

- ✅ WebSocket real-time tracking
- ✅ Organization-level data isolation
- ✅ Status transition validation
- ✅ Unavailable vehicle prevention
- ✅ Payment lifecycle management
- ✅ Role-based access control
- ✅ Dashboard analytics per role
- ✅ Tracking history storage

---

## 📝 Git Commit History