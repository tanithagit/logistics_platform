from pydantic import BaseModel
from typing import List, Optional
from app.schemas.delivery import DeliveryResponse

class AdminDashboard(BaseModel):
    total_deliveries: int
    pending_deliveries: int
    active_deliveries: int
    delivered_deliveries: int
    canceled_deliveries: int
    total_drivers: int
    active_drivers: int
    total_vehicles: int
    available_vehicles: int
    total_revenue: float
    delivery_success_rate: float

class DriverDashboard(BaseModel):
    total_assigned: int
    in_transit: int
    delivered_today: int
    total_delivered: int
    recent_deliveries: List[DeliveryResponse] = []

class CustomerDashboard(BaseModel):
    total_orders: int
    active_shipments: int
    delivered_orders: int
    canceled_orders: int
    total_spent: float
    recent_deliveries: List[DeliveryResponse] = []