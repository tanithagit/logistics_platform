from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import require_admin, get_current_user
from app.schemas.vehicle import (
    VehicleCreateRequest,
    VehicleUpdateRequest,
    VehicleResponse
)
from app.services import vehicle_service

router = APIRouter(prefix="/vehicles", tags=["Vehicle Management"])

@router.get("/", response_model=List[VehicleResponse])
def get_vehicles(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all vehicles in organization"""
    return vehicle_service.get_all_vehicles(
        current_user.organization_id,
        db
    )

@router.get("/available", response_model=List[VehicleResponse])
def get_available_vehicles(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get only active/available vehicles
    Used when assigning to a delivery
    """
    return vehicle_service.get_available_vehicles(
        current_user.organization_id,
        db
    )

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get a specific vehicle"""
    return vehicle_service.get_vehicle_by_id(
        vehicle_id,
        current_user.organization_id,
        db
    )

@router.post("/", response_model=VehicleResponse)
def create_vehicle(
    data: VehicleCreateRequest,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin adds a new vehicle to the fleet
    Requires: admin role
    """
    return vehicle_service.create_vehicle(
        data,
        current_user.organization_id,
        db
    )

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdateRequest,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin updates vehicle details or changes status"""
    return vehicle_service.update_vehicle(
        vehicle_id,
        data,
        current_user.organization_id,
        db
    )

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin removes a vehicle from fleet"""
    return vehicle_service.delete_vehicle(
        vehicle_id,
        current_user.organization_id,
        db
    )