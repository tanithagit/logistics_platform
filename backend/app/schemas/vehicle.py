from pydantic import BaseModel
from app.models.vehicle import VehicleType, VehicleStatus
from datetime import datetime
from typing import Optional

class VehicleCreateRequest(BaseModel):
    vehicle_number: str
    type: VehicleType
    capacity: float
    status: Optional[VehicleStatus] = VehicleStatus.active

class VehicleUpdateRequest(BaseModel):
    vehicle_number: Optional[str] = None
    type: Optional[VehicleType] = None
    capacity: Optional[float] = None
    status: Optional[VehicleStatus] = None

class VehicleResponse(BaseModel):
    id: int
    organization_id: int
    vehicle_number: str
    type: VehicleType
    capacity: float
    status: VehicleStatus
    created_at: datetime

    class Config:
        from_attributes = True