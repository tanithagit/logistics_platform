from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.delivery import Delivery, DeliveryStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.user import User, UserRole
from app.models.tracking import DeliveryTracking
from app.models.payment import Payment, PaymentStatus
from app.schemas.delivery import (
    DeliveryCreateRequest,
    DeliveryAssignRequest,
    DeliveryStatusUpdateRequest,
    TrackingUpdateRequest
)

# Valid status transitions — prevents invalid jumps
# Key = current status, Value = allowed next statuses
VALID_TRANSITIONS = {
    DeliveryStatus.pending: [DeliveryStatus.assigned, DeliveryStatus.canceled],
    DeliveryStatus.assigned: [DeliveryStatus.picked_up, DeliveryStatus.canceled],
    DeliveryStatus.picked_up: [DeliveryStatus.in_transit],
    DeliveryStatus.in_transit: [DeliveryStatus.delivered],
    DeliveryStatus.delivered: [],   # final state
    DeliveryStatus.canceled: [],    # final state
}

def create_delivery(
    data: DeliveryCreateRequest,
    customer: User,
    db: Session
):
    """
    Customer creates a new delivery request
    Status starts as PENDING
    """
    delivery = Delivery(
        organization_id=customer.organization_id,
        customer_id=customer.id,
        pickup_address=data.pickup_address,
        delivery_address=data.delivery_address,
        pickup_lat=data.pickup_lat,
        pickup_lng=data.pickup_lng,
        delivery_lat=data.delivery_lat,
        delivery_lng=data.delivery_lng,
        notes=data.notes,
        status=DeliveryStatus.pending
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)

    # Auto create a pending payment record
    payment = Payment(
        delivery_id=delivery.id,
        amount=0,  # cost set when admin assigns
        payment_status=PaymentStatus.pending
    )
    db.add(payment)
    db.commit()

    return delivery

def get_all_deliveries(organization_id: int, db: Session):
    """Admin gets all deliveries in their organization"""
    return db.query(Delivery).filter(
        Delivery.organization_id == organization_id
    ).order_by(Delivery.created_at.desc()).all()

def get_delivery_by_id(
    delivery_id: int,
    organization_id: int,
    db: Session
):
    """Get a specific delivery — must belong to organization"""
    delivery = db.query(Delivery).filter(
        Delivery.id == delivery_id,
        Delivery.organization_id == organization_id
    ).first()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )
    return delivery

def get_customer_deliveries(customer_id: int, organization_id: int, db: Session):
    """Customer gets only their own deliveries"""
    return db.query(Delivery).filter(
        Delivery.customer_id == customer_id,
        Delivery.organization_id == organization_id
    ).order_by(Delivery.created_at.desc()).all()

def get_driver_deliveries(driver_id: int, organization_id: int, db: Session):
    """Driver gets only deliveries assigned to them"""
    return db.query(Delivery).filter(
        Delivery.assigned_driver_id == driver_id,
        Delivery.organization_id == organization_id
    ).order_by(Delivery.created_at.desc()).all()

def assign_delivery(
    delivery_id: int,
    data: DeliveryAssignRequest,
    organization_id: int,
    db: Session
):
    """
    Admin assigns a driver and vehicle to a delivery
    Critical rules:
    - Vehicle must be ACTIVE
    - Driver must belong to same organization
    - Delivery must be in PENDING status
    """
    # Get the delivery
    delivery = get_delivery_by_id(delivery_id, organization_id, db)

    # Rule: can only assign pending deliveries
    if delivery.status != DeliveryStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot assign delivery with status: {delivery.status.value}"
        )

    # Rule: vehicle must exist and be ACTIVE
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == data.vehicle_id,
        Vehicle.organization_id == organization_id
    ).first()

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found in your organization"
        )

    if vehicle.status != VehicleStatus.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vehicle is not available. Current status: {vehicle.status.value}"
        )

    # Rule: driver must exist and belong to same organization
    driver = db.query(User).filter(
        User.id == data.driver_id,
        User.organization_id == organization_id,
        User.role == UserRole.driver
    ).first()

    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found in your organization"
        )

    # All checks passed — assign the delivery
    delivery.assigned_driver_id = data.driver_id
    delivery.assigned_vehicle_id = data.vehicle_id
    delivery.status = DeliveryStatus.assigned

    # Set cost if provided
    if data.total_cost:
        delivery.total_cost = data.total_cost
        # Update payment amount too
        payment = db.query(Payment).filter(
            Payment.delivery_id == delivery_id
        ).first()
        if payment:
            payment.amount = data.total_cost

    db.commit()
    db.refresh(delivery)
    return delivery

def update_delivery_status(
    delivery_id: int,
    data: DeliveryStatusUpdateRequest,
    driver: User,
    db: Session
):
    """
    Driver updates their delivery status
    Critical rules:
    - Driver can only update THEIR OWN deliveries
    - Status transitions must be valid
    """
    # Get the delivery
    delivery = db.query(Delivery).filter(
        Delivery.id == delivery_id,
        Delivery.organization_id == driver.organization_id
    ).first()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )

    # Rule: driver can only update their OWN deliveries
    if delivery.assigned_driver_id != driver.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own assigned deliveries"
        )

    # Rule: validate status transition
    allowed_transitions = VALID_TRANSITIONS.get(delivery.status, [])
    if data.status not in allowed_transitions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition: {delivery.status.value} → {data.status.value}. Allowed: {[s.value for s in allowed_transitions]}"
        )

    delivery.status = data.status
    db.commit()
    db.refresh(delivery)
    return delivery

def add_tracking_update(
    delivery_id: int,
    data: TrackingUpdateRequest,
    driver: User,
    db: Session
):
    """
    Driver sends their current GPS location
    Stored as tracking history
    """
    # Get the delivery
    delivery = db.query(Delivery).filter(
        Delivery.id == delivery_id,
        Delivery.organization_id == driver.organization_id
    ).first()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )

    # Rule: only assigned driver can update location
    if delivery.assigned_driver_id != driver.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update location for your own deliveries"
        )

    # Rule: must be active delivery
    if delivery.status in [DeliveryStatus.delivered, DeliveryStatus.canceled]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update location for completed or canceled delivery"
        )

    tracking = DeliveryTracking(
        delivery_id=delivery_id,
        latitude=data.latitude,
        longitude=data.longitude,
        address_snapshot=data.address_snapshot
    )
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    return tracking

def get_tracking_history(
    delivery_id: int,
    organization_id: int,
    db: Session
):
    """Get all location updates for a delivery"""
    # First verify delivery belongs to organization
    delivery = get_delivery_by_id(delivery_id, organization_id, db)

    return db.query(DeliveryTracking).filter(
        DeliveryTracking.delivery_id == delivery_id
    ).order_by(DeliveryTracking.updated_at.desc()).all()

def cancel_delivery(
    delivery_id: int,
    organization_id: int,
    db: Session
):
    """Admin or customer cancels a delivery"""
    delivery = get_delivery_by_id(delivery_id, organization_id, db)

    if delivery.status in [DeliveryStatus.delivered, DeliveryStatus.canceled]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a delivered or already canceled delivery"
        )

    delivery.status = DeliveryStatus.canceled
    db.commit()
    db.refresh(delivery)
    return delivery