import { io, Socket } from 'socket.io-client';

class RealtimeService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token: string) {
    if (this.socket) return;
    
    // In a real app, point this to the WebSocket server URL
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(url, {
      auth: {
        token
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to realtime server');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from realtime server');
    });
  }

  joinOrganization(orgId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_organization', orgId);
    }
  }

  subscribeToTasks(callback: (task: any) => void) {
    if (this.socket) {
      this.socket.on('task_updated', callback);
      this.socket.on('task_created', callback);
    }
  }

  subscribeToCRM(callback: (lead: any) => void) {
    if (this.socket) {
      this.socket.on('lead_updated', callback);
    }
  }

  subscribeToNotifications(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const realtime = new RealtimeService();
