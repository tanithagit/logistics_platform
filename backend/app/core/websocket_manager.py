from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    """
    Manages all active WebSocket connections
    
    Think of it like a chatroom manager:
    - When someone connects → add to list
    - When someone disconnects → remove from list
    - When driver sends location → broadcast to everyone
      watching that delivery
    """

    def __init__(self):
        # Dictionary: delivery_id → list of connected websockets
        # Example: {1: [ws1, ws2], 2: [ws3]}
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, delivery_id: int):
        """Accept and store a new connection"""
        await websocket.accept()
        if delivery_id not in self.active_connections:
            self.active_connections[delivery_id] = []
        self.active_connections[delivery_id].append(websocket)
        print(f"Client connected to delivery {delivery_id}. Total: {len(self.active_connections[delivery_id])}")

    def disconnect(self, websocket: WebSocket, delivery_id: int):
        """Remove a disconnected client"""
        if delivery_id in self.active_connections:
            self.active_connections[delivery_id].remove(websocket)
            if not self.active_connections[delivery_id]:
                del self.active_connections[delivery_id]
        print(f"Client disconnected from delivery {delivery_id}")

    async def broadcast_to_delivery(self, delivery_id: int, message: dict):
        """
        Send a message to ALL clients watching a specific delivery
        Used when driver updates location or status
        """
        if delivery_id in self.active_connections:
            disconnected = []
            for websocket in self.active_connections[delivery_id]:
                try:
                    await websocket.send_json(message)
                except Exception:
                    # Client disconnected unexpectedly
                    disconnected.append(websocket)

            # Clean up disconnected clients
            for ws in disconnected:
                self.active_connections[delivery_id].remove(ws)

# Single global instance — shared across the whole app
manager = ConnectionManager()