from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.payment import PaymentStatus

class PaymentCreateRequest(BaseModel):
    """Customer initiates payment"""
    amount: float
    transaction_reference: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    delivery_id: int
    amount: float
    payment_status: PaymentStatus
    transaction_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True