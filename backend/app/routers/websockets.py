from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.websocket_manager import manager
from app.models.delivery import Delivery
from app.models.tracking import DeliveryTracking
import json

router = APIRouter(tags=["WebSockets"])

@router.websocket("/ws/tracking/{delivery_id}")
async def tracking_websocket(
    websocket: WebSocket,
    delivery_id: int,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for live delivery tracking

    How to connect from frontend:
    const ws = new WebSocket('ws://localhost:8000/ws/tracking/1')

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        // update map with data.latitude, data.longitude
    }

    What you receive:
    {
        "type": "location_update",
        "delivery_id": 1,
        "latitude": 13.065,
        "longitude": 80.250,
        "address": "Near Vadapalani",
        "status": "in_transit"
    }
    """
    await manager.connect(websocket, delivery_id)

    try:
        # Send current delivery status immediately on connect
        delivery = db.query(Delivery).filter(
            Delivery.id == delivery_id
        ).first()

        if delivery:
            # Send latest tracking point if exists
            latest_tracking = db.query(DeliveryTracking).filter(
                DeliveryTracking.delivery_id == delivery_id
            ).order_by(DeliveryTracking.updated_at.desc()).first()

            initial_data = {
                "type": "connected",
                "delivery_id": delivery_id,
                "status": delivery.status.value,
                "message": "Connected to live tracking"
            }

            if latest_tracking:
                initial_data["latitude"] = latest_tracking.latitude
                initial_data["longitude"] = latest_tracking.longitude
                initial_data["address"] = latest_tracking.address_snapshot

            await websocket.send_json(initial_data)

        # Keep connection alive — listen for messages
        while True:
            # Wait for any message from client (ping/pong)
            data = await websocket.receive_text()

            # Echo back as acknowledgment
            await websocket.send_json({
                "type": "ping",
                "message": "Connection alive"
            })

    except WebSocketDisconnect:
        manager.disconnect(websocket, delivery_id)