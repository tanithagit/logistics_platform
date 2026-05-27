from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.delivery import DeliveryStatus

class DeliveryCreateRequest(BaseModel):
    """Customer creates a delivery request"""
    pickup_address: str
    delivery_address: str
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    notes: Optional[str] = None

class DeliveryAssignRequest(BaseModel):
    """Admin assigns driver and vehicle"""
    driver_id: int
    vehicle_id: int
    total_cost: Optional[float] = None

class DeliveryStatusUpdateRequest(BaseModel):
    """Driver updates delivery status"""
    status: DeliveryStatus

class TrackingUpdateRequest(BaseModel):
    """Driver sends location update"""
    latitude: float
    longitude: float
    address_snapshot: Optional[str] = None

class TrackingResponse(BaseModel):
    id: int
    delivery_id: int
    latitude: float
    longitude: float
    address_snapshot: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class DeliveryResponse(BaseModel):
    id: int
    organization_id: int
    customer_id: int
    assigned_driver_id: Optional[int] = None
    assigned_vehicle_id: Optional[int] = None
    pickup_address: str
    delivery_address: str
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    status: DeliveryStatus
    total_cost: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DeliveryDetailResponse(DeliveryResponse):
    """Extended response with tracking info"""
    tracking_updates: List[TrackingResponse] = []

    class Config:
        from_attributes = True