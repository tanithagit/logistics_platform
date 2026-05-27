from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import (
    require_admin,
    require_driver,
    require_customer,
    get_current_user
)
from app.schemas.delivery import (
    DeliveryCreateRequest,
    DeliveryAssignRequest,
    DeliveryStatusUpdateRequest,
    TrackingUpdateRequest,
    DeliveryResponse,
    DeliveryDetailResponse,
    TrackingResponse
)
from app.schemas.payment import PaymentCreateRequest, PaymentResponse
from app.services import delivery_service, payment_service

router = APIRouter(prefix="/deliveries", tags=["Delivery Management"])

# ─── Customer Endpoints ───────────────────────────────────────

@router.post("/", response_model=DeliveryResponse)
def create_delivery(
    data: DeliveryCreateRequest,
    current_user=Depends(require_customer),
    db: Session = Depends(get_db)
):
    """
    Customer creates a new delivery request
    Status starts as PENDING
    """
    return delivery_service.create_delivery(data, current_user, db)

@router.get("/my-deliveries", response_model=List[DeliveryResponse])
def get_my_deliveries(
    current_user=Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Customer views their own deliveries"""
    return delivery_service.get_customer_deliveries(
        current_user.id,
        current_user.organization_id,
        db
    )

# ─── Driver Endpoints ─────────────────────────────────────────

@router.get("/assigned", response_model=List[DeliveryResponse])
def get_assigned_deliveries(
    current_user=Depends(require_driver),
    db: Session = Depends(get_db)
):
    """Driver views deliveries assigned to them"""
    return delivery_service.get_driver_deliveries(
        current_user.id,
        current_user.organization_id,
        db
    )

@router.put("/{delivery_id}/status", response_model=DeliveryResponse)
def update_status(
    delivery_id: int,
    data: DeliveryStatusUpdateRequest,
    current_user=Depends(require_driver),
    db: Session = Depends(get_db)
):
    """
    Driver updates delivery status
    Rules: own deliveries only, valid transitions only
    """
    return delivery_service.update_delivery_status(
        delivery_id, data, current_user, db
    )

@router.post("/{delivery_id}/tracking", response_model=TrackingResponse)
def add_tracking(
    delivery_id: int,
    data: TrackingUpdateRequest,
    current_user=Depends(require_driver),
    db: Session = Depends(get_db)
):
    """Driver sends current GPS location"""
    return delivery_service.add_tracking_update(
        delivery_id, data, current_user, db
    )

# ─── Admin Endpoints ──────────────────────────────────────────

@router.get("/", response_model=List[DeliveryResponse])
def get_all_deliveries(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin views all deliveries in their organization"""
    return delivery_service.get_all_deliveries(
        current_user.organization_id, db
    )

@router.get("/{delivery_id}", response_model=DeliveryDetailResponse)
def get_delivery(
    delivery_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get delivery details with tracking history"""
    return delivery_service.get_delivery_by_id(
        delivery_id,
        current_user.organization_id,
        db
    )

@router.put("/{delivery_id}/assign", response_model=DeliveryResponse)
def assign_delivery(
    delivery_id: int,
    data: DeliveryAssignRequest,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin assigns driver and vehicle to delivery
    Validates vehicle availability
    """
    return delivery_service.assign_delivery(
        delivery_id, data, current_user.organization_id, db
    )

@router.put("/{delivery_id}/cancel", response_model=DeliveryResponse)
def cancel_delivery(
    delivery_id: int,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin cancels a delivery"""
    return delivery_service.cancel_delivery(
        delivery_id,
        current_user.organization_id,
        db
    )

@router.get("/{delivery_id}/tracking", response_model=List[TrackingResponse])
def get_tracking(
    delivery_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tracking history for a delivery"""
    return delivery_service.get_tracking_history(
        delivery_id,
        current_user.organization_id,
        db
    )

# ─── Payment Endpoints ────────────────────────────────────────

@router.post("/{delivery_id}/payment", response_model=PaymentResponse)
def make_payment(
    delivery_id: int,
    data: PaymentCreateRequest,
    current_user=Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Customer pays for delivery"""
    return payment_service.process_payment(
        delivery_id, data, current_user.organization_id, db
    )

@router.get("/{delivery_id}/payment", response_model=PaymentResponse)
def get_payment(
    delivery_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment status for a delivery"""
    return payment_service.get_payment_by_delivery(
        delivery_id,
        current_user.organization_id,
        db
    )