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

    // Initialize socket connection
    socketRef.current = io(API_BASE_URL, {
      transports: ["polling", "websocket"], // Try polling first for Railway
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
      forceNew: false,
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Handle connection
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");

      // Authenticate user with server
      socket.emit("authenticate", {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      });

      onConnect?.();
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket server:", reason);
      onDisconnect?.();
    });

    // Handle request updates
    socket.on("requestUpdate", (data) => {
      console.log("🔥 WebSocket received requestUpdate event:", data);
      if (onRequestUpdate) {
        console.log("🔥 Calling onRequestUpdate handler");
        onRequestUpdate(data);
      } else {
        console.log("❌ No onRequestUpdate handler provided");
      }
    });

    // Handle reconnection
    socket.on("reconnect", (attemptNumber) => {
      console.log("WebSocket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("WebSocket reconnection attempt:", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
      console.error("WebSocket reconnection error:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error("WebSocket reconnection failed");
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
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
