from fastapi import WebSocket
from typing import Dict

class WebSocket_Connection_Manager:
    def __init__(self):
        # Map user_id (str) -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, user_id: str, data: dict):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(data)
            except Exception:
                # If the socket is closed, remove it from active connections
                self.disconnect(user_id)
        
        
websocket_manager = WebSocket_Connection_Manager()