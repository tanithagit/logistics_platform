from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class VehicleType(str, enum.Enum):
    truck = "truck"
    van = "van"
    bike = "bike"
    car = "car"

class VehicleStatus(str, enum.Enum):
    active = "active"
    maintenance = "maintenance"
    unavailable = "unavailable"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    vehicle_number = Column(String, unique=True, nullable=False)
    type = Column(Enum(VehicleType), nullable=False)
    capacity = Column(Float, nullable=False)  # in kg or cubic meters
    status = Column(Enum(VehicleStatus), default=VehicleStatus.active)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="vehicles")
    deliveries = relationship("Delivery", back_populates="assigned_vehicle")