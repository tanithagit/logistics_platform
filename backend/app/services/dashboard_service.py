from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from app.models.delivery import Delivery, DeliveryStatus
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.payment import Payment, PaymentStatus

def get_admin_dashboard(organization_id: int, db: Session):
    """
    Admin sees full organization overview
    """
    # Delivery counts by status
    total_deliveries = db.query(Delivery).filter(
        Delivery.organization_id == organization_id
    ).count()

    pending = db.query(Delivery).filter(
        Delivery.organization_id == organization_id,
        Delivery.status == DeliveryStatus.pending
    ).count()

    # Active = assigned + picked_up + in_transit
    active = db.query(Delivery).filter(
        Delivery.organization_id == organization_id,
        Delivery.status.in_([
            DeliveryStatus.assigned,
            DeliveryStatus.picked_up,
            DeliveryStatus.in_transit
        ])
    ).count()

    delivered = db.query(Delivery).filter(
        Delivery.organization_id == organization_id,
        Delivery.status == DeliveryStatus.delivered
    ).count()

    canceled = db.query(Delivery).filter(
        Delivery.organization_id == organization_id,
        Delivery.status == DeliveryStatus.canceled
    ).count()

    # Driver counts
    total_drivers = db.query(User).filter(
        User.organization_id == organization_id,
        User.role == UserRole.driver
    ).count()

    # Active drivers = drivers who have in_transit deliveries
    active_drivers = db.query(Delivery.assigned_driver_id).filter(
        Delivery.organization_id == organization_id,
        Delivery.status == DeliveryStatus.in_transit,
        Delivery.assigned_driver_id.isnot(None)
    ).distinct().count()

    # Vehicle counts
    total_vehicles = db.query(Vehicle).filter(
        Vehicle.organization_id == organization_id
    ).count()

    available_vehicles = db.query(Vehicle).filter(
        Vehicle.organization_id == organization_id,
        Vehicle.status == VehicleStatus.active
    ).count()

    # Revenue — sum of paid payments
    revenue_result = db.query(func.sum(Payment.amount)).join(
        Delivery, Payment.delivery_id == Delivery.id
    ).filter(
        Delivery.organization_id == organization_id,
        Payment.payment_status == PaymentStatus.paid
    ).scalar()

    total_revenue = float(revenue_result or 0)

    # Success rate
    success_rate = 0.0
    if total_deliveries > 0:
        success_rate = round((delivered / total_deliveries) * 100, 2)

    return {
        "total_deliveries": total_deliveries,
        "pending_deliveries": pending,
        "active_deliveries": active,
        "delivered_deliveries": delivered,
        "canceled_deliveries": canceled,
        "total_drivers": total_drivers,
        "active_drivers": active_drivers,
        "total_vehicles": total_vehicles,
        "available_vehicles": available_vehicles,
        "total_revenue": total_revenue,
        "delivery_success_rate": success_rate
    }

def get_driver_dashboard(driver_id: int, organization_id: int, db: Session):
    """
    Driver sees their own delivery stats
    """
    total_assigned = db.query(Delivery).filter(
        Delivery.assigned_driver_id == driver_id,
        Delivery.organization_id == organization_id
    ).count()

    in_transit = db.query(Delivery).filter(
        Delivery.assigned_driver_id == driver_id,
        Delivery.organization_id == organization_id,
        Delivery.status == DeliveryStatus.in_transit
    ).count()

    # Delivered today
    today = date.today()
    delivered_today = db.query(Delivery).filter(
        Delivery.assigned_driver_id == driver_id,
        Delivery.organization_id == organization_id,
        Delivery.status == DeliveryStatus.delivered,
        func.date(Delivery.updated_at) == today
    ).count()

    total_delivered = db.query(Delivery).filter(
        Delivery.assigned_driver_id == driver_id,
        Delivery.organization_id == organization_id,
        Delivery.status == DeliveryStatus.delivered
    ).count()

    # Recent 5 deliveries
    recent = db.query(Delivery).filter(
        Delivery.assigned_driver_id == driver_id,
        Delivery.organization_id == organization_id
    ).order_by(Delivery.created_at.desc()).limit(5).all()

    return {
        "total_assigned": total_assigned,
        "in_transit": in_transit,
        "delivered_today": delivered_today,
        "total_delivered": total_delivered,
        "recent_deliveries": recent
    }

def get_customer_dashboard(customer_id: int, organization_id: int, db: Session):
    """
    Customer sees their own order stats
    """
    total_orders = db.query(Delivery).filter(
        Delivery.customer_id == customer_id,
        Delivery.organization_id == organization_id
    ).count()

    active_shipments = db.query(Delivery).filter(
        Delivery.customer_id == customer_id,
        Delivery.organization_id == organization_id,
        Delivery.status.in_([
            DeliveryStatus.assigned,
            DeliveryStatus.picked_up,
            DeliveryStatus.in_transit
        ])
    ).count()

    delivered_orders = db.query(Delivery).filter(
        Delivery.customer_id == customer_id,
        Delivery.organization_id == organization_id,
        Delivery.status == DeliveryStatus.delivered
    ).count()

    canceled_orders = db.query(Delivery).filter(
        Delivery.customer_id == customer_id,
        Delivery.organization_id == organization_id,
        Delivery.status == DeliveryStatus.canceled
    ).count()

    # Total amount spent
    spent_result = db.query(func.sum(Payment.amount)).join(
        Delivery, Payment.delivery_id == Delivery.id
    ).filter(
        Delivery.customer_id == customer_id,
        Delivery.organization_id == organization_id,
        Payment.payment_status == PaymentStatus.paid
    ).scalar()

    total_spent = float(spent_result or 0)

    # Recent 5 orders
    recent = db.query(Delivery).filter(
        Delivery.customer_id == customer_id,
        Delivery.organization_id == organization_id
    ).order_by(Delivery.created_at.desc()).limit(5).all()

    return {
        "total_orders": total_orders,
        "active_shipments": active_shipments,
        "delivered_orders": delivered_orders,
        "canceled_orders": canceled_orders,
        "total_spent": total_spent,
        "recent_deliveries": recent
    }