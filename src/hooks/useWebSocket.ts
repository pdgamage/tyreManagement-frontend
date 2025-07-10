import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface WebSocketHookProps {
  onRequestUpdate?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useWebSocket = ({ 
  onRequestUpdate, 
  onConnect, 
  onDisconnect 
}: WebSocketHookProps = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) return;

    // Initialize socket connection
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    const socket = socketRef.current;

    // Handle connection
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      
      // Authenticate user with server
      socket.emit('authenticate', {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email
      });

      onConnect?.();
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      onDisconnect?.();
    });

    // Handle request updates
    socket.on('requestUpdate', (data) => {
      console.log('Received request update:', data);
      onRequestUpdate?.(data);
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, onRequestUpdate, onConnect, onDisconnect]);

  // Function to manually emit events
  const emit = (eventName: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data);
    }
  };

  return {
    socket: socketRef.current,
    emit,
    isConnected: socketRef.current?.connected || false
  };
};
