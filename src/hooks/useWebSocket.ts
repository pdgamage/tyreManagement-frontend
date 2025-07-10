import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface WebSocketHookProps {
  onRequestUpdate?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useWebSocket = ({
  onRequestUpdate,
  onConnect,
  onDisconnect,
}: WebSocketHookProps = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) return;

    // Initialize socket connection with stable settings
    socketRef.current = io(API_BASE_URL, {
      transports: ["polling"], // Use only polling for Railway
      timeout: 30000,
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5, // Limit attempts to prevent infinite loops
      reconnectionDelayMax: 10000,
      forceNew: false, // Don't force new connections
      autoConnect: true,
      withCredentials: false,
    });

    const socket = socketRef.current;

    // Handle connection
    socket.on("connect", () => {
      // Authenticate user with server
      socket.emit("authenticate", {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      });

      onConnect?.();
    });

    // Handle ping from server
    socket.on("ping", (data) => {
      // Respond with pong
      socket.emit("pong", {
        timestamp: new Date().toISOString(),
        userId: user.id,
      });
    });

    // Handle authentication confirmation
    socket.on("authenticated", (data) => {
      // Authentication successful
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      onDisconnect?.();
    });

    // Handle request updates
    socket.on("requestUpdate", (data) => {
      if (onRequestUpdate) {
        onRequestUpdate(data);
      }
    });

    // Handle reconnection
    socket.on("reconnect", (attemptNumber) => {
      // Reconnected successfully
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      // Attempting to reconnect
    });

    socket.on("reconnect_error", (error) => {
      // Reconnection error
    });

    socket.on("reconnect_failed", () => {
      // Reconnection failed
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      // Connection error - will retry automatically
    });

    // Handle reconnection events
    socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      window.dispatchEvent(new CustomEvent("ws-connect"));
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 WebSocket reconnection attempt #${attemptNumber}`);
      window.dispatchEvent(new CustomEvent("ws-attempt"));
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ WebSocket reconnection error:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ WebSocket reconnection failed completely");
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
    isConnected: socketRef.current?.connected || false,
  };
};
