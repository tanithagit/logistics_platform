from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.payment import Payment, PaymentStatus
from app.models.delivery import Delivery
from app.schemas.payment import PaymentCreateRequest

def get_payment_by_delivery(
    delivery_id: int,
    organization_id: int,
    db: Session
):
    """Get payment info for a delivery"""
    delivery = db.query(Delivery).filter(
        Delivery.id == delivery_id,
        Delivery.organization_id == organization_id
    ).first()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )

    payment = db.query(Payment).filter(
        Payment.delivery_id == delivery_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    return payment

def process_payment(
    delivery_id: int,
    data: PaymentCreateRequest,
    organization_id: int,
    db: Session
):
    """
    Customer pays for delivery
    Simulated payment processing
    """
    payment = get_payment_by_delivery(delivery_id, organization_id, db)

    # Cannot pay twice
    if payment.payment_status == PaymentStatus.paid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already completed"
        )

    # Process the payment
    payment.amount = data.amount
    payment.payment_status = PaymentStatus.paid
    payment.transaction_reference = (
        data.transaction_reference or f"TXN-{delivery_id}-{payment.id}"
    )

    db.commit()
    db.refresh(payment)
    return payment