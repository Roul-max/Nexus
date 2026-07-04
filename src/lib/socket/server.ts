import { Server as SocketIOServer } from 'socket.io';

// Since Next.js App Router API routes don't easily expose the raw response object 
// required to attach Socket.io, it's generally recommended to run a separate Node server 
// for WebSockets, or use a PaaS solution like Pusher.
// We are adding a basic setup that can be expanded if a custom server.ts is added.

export function initSocket(server: any) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Configure this to specific origins in production
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_organization', (orgId) => {
      socket.join(`org_${orgId}`);
      console.log(`Socket ${socket.id} joined organization ${orgId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
