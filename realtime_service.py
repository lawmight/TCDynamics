"""
Real-time Service for TCDynamics
Handles WebSocket connections and real-time updates
"""

import asyncio
import json
import logging
import time
from typing import Dict, Set, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import uuid

try:
    import websockets
    from websockets.server import WebSocketServerProtocol
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    WEBSOCKETS_AVAILABLE = False
    logging.warning("WebSockets not available - install websockets package")
    # Create a dummy class for type hints when websockets is not available
    class WebSocketServerProtocol:
        pass

@dataclass
class UserConnection:
    """User WebSocket connection info"""
    user_id: str
    websocket: WebSocketServerProtocol
    connected_at: str
    last_activity: str
    user_agent: str = ""
    ip_address: str = ""

@dataclass
class RealtimeEvent:
    """Real-time event data"""
    id: str
    type: str
    data: Dict
    timestamp: str
    user_id: str
    broadcast: bool = True

class RealtimeService:
    """Real-time communication service"""
    
    def __init__(self):
        self.connections: Dict[str, UserConnection] = {}
        self.event_history: List[RealtimeEvent] = []
        self.logger = logging.getLogger(__name__)
        self.max_history = 1000
        
        # Event handlers
        self.event_handlers = {
            'progress_update': self._handle_progress_update,
            'achievement_unlocked': self._handle_achievement_unlocked,
            'user_joined': self._handle_user_joined,
            'user_left': self._handle_user_left,
            'code_executed': self._handle_code_executed,
            'chat_message': self._handle_chat_message
        }
    
    async def handle_connection(self, websocket: WebSocketServerProtocol, path: str):
        """Handle new WebSocket connection"""
        user_id = await self._authenticate_user(websocket)
        if not user_id:
            await websocket.close(code=1008, reason="Authentication failed")
            return
        
        # Create user connection
        connection = UserConnection(
            user_id=user_id,
            websocket=websocket,
            connected_at=datetime.now().isoformat(),
            last_activity=datetime.now().isoformat(),
            user_agent=websocket.request_headers.get('User-Agent', ''),
            ip_address=websocket.remote_address[0] if websocket.remote_address else ''
        )
        
        self.connections[user_id] = connection
        self.logger.info(f"User {user_id} connected")
        
        # Send welcome message
        await self._send_to_user(user_id, {
            'type': 'welcome',
            'data': {
                'user_id': user_id,
                'connected_users': len(self.connections),
                'server_time': datetime.now().isoformat()
            }
        })
        
        # Broadcast user joined event
        await self._broadcast_event('user_joined', {
            'user_id': user_id,
            'connected_users': len(self.connections)
        }, exclude_user=user_id)
        
        try:
            # Handle messages from this connection
            async for message in websocket:
                await self._handle_message(user_id, message)
        except websockets.exceptions.ConnectionClosed:
            self.logger.info(f"User {user_id} disconnected")
        finally:
            # Clean up connection
            if user_id in self.connections:
                del self.connections[user_id]
            
            # Broadcast user left event
            await self._broadcast_event('user_left', {
                'user_id': user_id,
                'connected_users': len(self.connections)
            })
    
    async def _authenticate_user(self, websocket: WebSocketServerProtocol) -> Optional[str]:
        """Authenticate user (simplified for demo)"""
        # In a real implementation, you'd validate JWT tokens or session cookies
        # For now, we'll generate a random user ID
        return f"user_{uuid.uuid4().hex[:8]}"
    
    async def _handle_message(self, user_id: str, message: str):
        """Handle incoming message from user"""
        try:
            data = json.loads(message)
            event_type = data.get('type')
            event_data = data.get('data', {})
            
            # Update last activity
            if user_id in self.connections:
                self.connections[user_id].last_activity = datetime.now().isoformat()
            
            # Handle event
            if event_type in self.event_handlers:
                await self.event_handlers[event_type](user_id, event_data)
            else:
                self.logger.warning(f"Unknown event type: {event_type}")
                
        except json.JSONDecodeError:
            self.logger.error(f"Invalid JSON from user {user_id}: {message}")
        except Exception as e:
            self.logger.error(f"Error handling message from user {user_id}: {e}")
    
    async def _handle_progress_update(self, user_id: str, data: Dict):
        """Handle progress update event"""
        event = RealtimeEvent(
            id=str(uuid.uuid4()),
            type='progress_update',
            data=data,
            timestamp=datetime.now().isoformat(),
            user_id=user_id
        )
        
        self._add_to_history(event)
        
        # Broadcast to all users
        await self._broadcast_event('progress_update', {
            'user_id': user_id,
            'day': data.get('day'),
            'completed': data.get('completed'),
            'timestamp': event.timestamp
        })
    
    async def _handle_achievement_unlocked(self, user_id: str, data: Dict):
        """Handle achievement unlocked event"""
        event = RealtimeEvent(
            id=str(uuid.uuid4()),
            type='achievement_unlocked',
            data=data,
            timestamp=datetime.now().isoformat(),
            user_id=user_id
        )
        
        self._add_to_history(event)
        
        # Broadcast to all users
        await self._broadcast_event('achievement_unlocked', {
            'user_id': user_id,
            'achievement': data.get('achievement'),
            'timestamp': event.timestamp
        })
    
    async def _handle_user_joined(self, user_id: str, data: Dict):
        """Handle user joined event"""
        # This is handled in the connection handler
        pass
    
    async def _handle_user_left(self, user_id: str, data: Dict):
        """Handle user left event"""
        # This is handled in the connection cleanup
        pass
    
    async def _handle_code_executed(self, user_id: str, data: Dict):
        """Handle code execution event"""
        event = RealtimeEvent(
            id=str(uuid.uuid4()),
            type='code_executed',
            data=data,
            timestamp=datetime.now().isoformat(),
            user_id=user_id
        )
        
        self._add_to_history(event)
        
        # Broadcast to all users (for learning purposes)
        await self._broadcast_event('code_executed', {
            'user_id': user_id,
            'success': data.get('success'),
            'execution_time': data.get('execution_time'),
            'timestamp': event.timestamp
        })
    
    async def _handle_chat_message(self, user_id: str, data: Dict):
        """Handle chat message event"""
        event = RealtimeEvent(
            id=str(uuid.uuid4()),
            type='chat_message',
            data=data,
            timestamp=datetime.now().isoformat(),
            user_id=user_id
        )
        
        self._add_to_history(event)
        
        # Broadcast to all users
        await self._broadcast_event('chat_message', {
            'user_id': user_id,
            'message': data.get('message'),
            'timestamp': event.timestamp
        })
    
    async def _send_to_user(self, user_id: str, message: Dict):
        """Send message to specific user"""
        if user_id in self.connections:
            try:
                await self.connections[user_id].websocket.send(json.dumps(message))
            except websockets.exceptions.ConnectionClosed:
                # Remove disconnected user
                if user_id in self.connections:
                    del self.connections[user_id]
            except Exception as e:
                self.logger.error(f"Error sending message to user {user_id}: {e}")
    
    async def _broadcast_event(self, event_type: str, data: Dict, exclude_user: str = None):
        """Broadcast event to all connected users"""
        message = {
            'type': event_type,
            'data': data,
            'timestamp': datetime.now().isoformat()
        }
        
        # Send to all connected users except excluded one
        for user_id, connection in self.connections.items():
            if user_id != exclude_user:
                try:
                    await connection.websocket.send(json.dumps(message))
                except websockets.exceptions.ConnectionClosed:
                    # Remove disconnected user
                    if user_id in self.connections:
                        del self.connections[user_id]
                except Exception as e:
                    self.logger.error(f"Error broadcasting to user {user_id}: {e}")
    
    def _add_to_history(self, event: RealtimeEvent):
        """Add event to history"""
        self.event_history.append(event)
        
        # Limit history size
        if len(self.event_history) > self.max_history:
            self.event_history.pop(0)
    
    async def get_connected_users(self) -> List[Dict]:
        """Get list of connected users"""
        return [
            {
                'user_id': user_id,
                'connected_at': connection.connected_at,
                'last_activity': connection.last_activity,
                'user_agent': connection.user_agent,
                'ip_address': connection.ip_address
            }
            for user_id, connection in self.connections.items()
        ]
    
    async def get_recent_events(self, limit: int = 50) -> List[Dict]:
        """Get recent events"""
        return [asdict(event) for event in self.event_history[-limit:]]
    
    async def cleanup_inactive_connections(self, timeout_minutes: int = 30):
        """Clean up inactive connections"""
        current_time = datetime.now()
        inactive_users = []
        
        for user_id, connection in self.connections.items():
            last_activity = datetime.fromisoformat(connection.last_activity)
            if (current_time - last_activity).total_seconds() > timeout_minutes * 60:
                inactive_users.append(user_id)
        
        for user_id in inactive_users:
            if user_id in self.connections:
                try:
                    await self.connections[user_id].websocket.close()
                except:
                    pass
                del self.connections[user_id]
                self.logger.info(f"Cleaned up inactive connection for user {user_id}")

# Global realtime service instance
realtime_service = RealtimeService()

async def start_realtime_server(host: str = "localhost", port: int = 8765):
    """Start the real-time WebSocket server"""
    if not WEBSOCKETS_AVAILABLE:
        logging.error("WebSockets not available - cannot start realtime server")
        return
    
    logging.info(f"Starting real-time server on {host}:{port}")
    
    async def cleanup_task():
        """Periodic cleanup task"""
        while True:
            await asyncio.sleep(300)  # 5 minutes
            await realtime_service.cleanup_inactive_connections()
    
    # Start cleanup task
    asyncio.create_task(cleanup_task())
    
    # Start WebSocket server
    async with websockets.serve(realtime_service.handle_connection, host, port):
        logging.info("Real-time server started")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Start server
    asyncio.run(start_realtime_server())
