from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class DeliveryStatus(str, enum.Enum):
    pending = "pending"
    assigned = "assigned"
    picked_up = "picked_up"
    in_transit = "in_transit"
    delivered = "delivered"
    canceled = "canceled"

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_driver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)

    # Addresses
    pickup_address = Column(String, nullable=False)
    delivery_address = Column(String, nullable=False)
    pickup_lat = Column(Float, nullable=True)
    pickup_lng = Column(Float, nullable=True)
    delivery_lat = Column(Float, nullable=True)
    delivery_lng = Column(Float, nullable=True)

    # Status & cost
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.pending)
    total_cost = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="deliveries")
    customer = relationship(
        "User",
        foreign_keys=[customer_id],
        back_populates="deliveries_as_customer"
    )
    assigned_driver = relationship(
        "User",
        foreign_keys=[assigned_driver_id],
        back_populates="deliveries_as_driver"
    )
    assigned_vehicle = relationship("Vehicle", back_populates="deliveries")
    tracking_updates = relationship("DeliveryTracking", back_populates="delivery")
    payment = relationship("Payment", back_populates="delivery", uselist=False)