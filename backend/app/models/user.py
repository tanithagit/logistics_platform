from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

# Enum = a fixed list of allowed values
class UserRole(str, enum.Enum):
    admin = "admin"
    driver = "driver"
    customer = "customer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    is_active = Column(String, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    deliveries_as_driver = relationship(
        "Delivery",
        foreign_keys="Delivery.assigned_driver_id",
        back_populates="assigned_driver"
    )
    deliveries_as_customer = relationship(
        "Delivery",
        foreign_keys="Delivery.customer_id",
        back_populates="customer"
    )