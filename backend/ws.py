import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket

# Lightweight WebSocket manager to broadcast job events to connected clients (by user_id)
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.setdefault(user_id, set()).add(websocket)
        print(f"[ws.manager] Connection accepted for user {user_id}. Active connections: {len(self.active_connections.get(user_id, []))}")

        # Send initial snapshot of applied/rejected jobs (read from graph storage)
        try:
            from graph import _read_list
            applied = _read_list(user_id, 'applied')
            rejected = _read_list(user_id, 'rejected')
            await websocket.send_json({'type': 'initial', 'applied': applied, 'rejected': rejected})
            print(f"[ws.manager] Sent initial snapshot to {user_id}: applied={len(applied)} rejected={len(rejected)}")
        except Exception as e:
            print(f"[ws.manager] Error sending initial snapshot to {user_id}: {e}")
            # If graph isn't importable in some test env, skip the initial snapshot
            try:
                await websocket.send_json({'type': 'initial', 'applied': [], 'rejected': []})
            except Exception as e2:
                print(f"[ws.manager] Error sending fallback initial to {user_id}: {e2}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        conns = self.active_connections.get(user_id)
        if conns and websocket in conns:
            conns.remove(websocket)
            if not conns:
                del self.active_connections[user_id]
        print(f"[ws.manager] Disconnected websocket for {user_id}. Remaining: {len(self.active_connections.get(user_id, [])) if user_id in self.active_connections else 0}")

    async def send_to_user(self, user_id: str, payload: dict):
        conns = list(self.active_connections.get(user_id, set()))
        print(f"[ws.manager] Sending payload to {user_id} on {len(conns)} connections")
        for ws in conns:
            try:
                await ws.send_json({'type': 'update', 'payload': payload})
            except Exception as e:
                print(f"[ws.manager] Error sending to {user_id}: {e}")
                # ignore send errors; disconnect will clean later
                pass

manager = ConnectionManager()

# Sync helper used by other modules (graph.py) to emit events from sync code
def send_user_event(user_id: str, payload: dict):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    async def _send():
        await manager.send_to_user(user_id, payload)

    if loop and loop.is_running():
        asyncio.run_coroutine_threadsafe(_send(), loop)
    else:
        # If no running loop is available (e.g., in some tests), skip event sending silently
        pass

    def disconnect(self, websocket: WebSocket, user_id: str):
        conns = self.active_connections.get(user_id)
        if conns and websocket in conns:
            conns.remove(websocket)
            if not conns:
                del self.active_connections[user_id]

    async def send_to_user(self, user_id: str, payload: dict):
        conns = list(self.active_connections.get(user_id, set()))
        for ws in conns:
            try:
                await ws.send_json({'type': 'update', 'payload': payload})
            except Exception:
                # ignore send errors; disconnect will clean later
                pass

manager = ConnectionManager()

# Sync helper used by other modules (graph.py) to emit events from sync code
def send_user_event(user_id: str, payload: dict):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    async def _send():
        await manager.send_to_user(user_id, payload)

    if loop and loop.is_running():
        asyncio.run_coroutine_threadsafe(_send(), loop)
    else:
        # If no running loop is available (e.g., in some tests), skip event sending silently
        pass