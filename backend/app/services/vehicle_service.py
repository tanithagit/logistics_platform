from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.vehicle import VehicleCreateRequest, VehicleUpdateRequest

def get_all_vehicles(organization_id: int, db: Session):
    """Get all vehicles for an organization"""
    return db.query(Vehicle).filter(
        Vehicle.organization_id == organization_id
    ).all()

def get_available_vehicles(organization_id: int, db: Session):
    """
    Get only ACTIVE vehicles
    Used when assigning vehicle to a delivery
    """
    return db.query(Vehicle).filter(
        Vehicle.organization_id == organization_id,
        Vehicle.status == VehicleStatus.active
    ).all()

def get_vehicle_by_id(
    vehicle_id: int,
    organization_id: int,
    db: Session
):
    """Get a specific vehicle — must belong to same organization"""
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.organization_id == organization_id
    ).first()

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found in your organization"
        )
    return vehicle

def create_vehicle(
    data: VehicleCreateRequest,
    organization_id: int,
    db: Session
):
    """Admin adds a new vehicle to the fleet"""

    # Check vehicle number is unique
    existing = db.query(Vehicle).filter(
        Vehicle.vehicle_number == data.vehicle_number
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle number already exists"
        )

    vehicle = Vehicle(
        organization_id=organization_id,
        vehicle_number=data.vehicle_number,
        type=data.type,
        capacity=data.capacity,
        status=data.status
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdateRequest,
    organization_id: int,
    db: Session
):
    """Admin updates vehicle details or status"""
    vehicle = get_vehicle_by_id(vehicle_id, organization_id, db)

    if data.vehicle_number is not None:
        vehicle.vehicle_number = data.vehicle_number
    if data.type is not None:
        vehicle.type = data.type
    if data.capacity is not None:
        vehicle.capacity = data.capacity
    if data.status is not None:
        vehicle.status = data.status

    db.commit()
    db.refresh(vehicle)
    return vehicle

def delete_vehicle(
    vehicle_id: int,
    organization_id: int,
    db: Session
):
    """Admin removes a vehicle"""
    vehicle = get_vehicle_by_id(vehicle_id, organization_id, db)
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle deleted successfully"}