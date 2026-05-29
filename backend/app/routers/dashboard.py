from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import (
    require_admin,
    require_driver,
    require_customer
)
from app.schemas.dashboard import (
    AdminDashboard,
    DriverDashboard,
    CustomerDashboard
)
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/admin", response_model=AdminDashboard)
def admin_dashboard(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin dashboard — full organization overview
    Shows deliveries, drivers, vehicles, revenue
    """
    return dashboard_service.get_admin_dashboard(
        current_user.organization_id,
        db
    )

@router.get("/driver", response_model=DriverDashboard)
def driver_dashboard(
    current_user=Depends(require_driver),
    db: Session = Depends(get_db)
):
    """
    Driver dashboard — personal delivery stats
    """
    return dashboard_service.get_driver_dashboard(
        current_user.id,
        current_user.organization_id,
        db
    )

@router.get("/customer", response_model=CustomerDashboard)
def customer_dashboard(
    current_user=Depends(require_customer),
    db: Session = Depends(get_db)
):
    """
    Customer dashboard — personal order history
    """
    return dashboard_service.get_customer_dashboard(
        current_user.id,
        current_user.organization_id,
        db
    )