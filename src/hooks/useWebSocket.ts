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

    // Initialize socket connection with Railway-optimized settings
    socketRef.current = io(API_BASE_URL, {
      transports: ["polling"], // Use only polling for Railway
      timeout: 60000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 10000,
      forceNew: true, // Force new connection each time
      autoConnect: true,
      withCredentials: false,
    });

    console.log("🔌 Initializing WebSocket connection to:", API_BASE_URL);

    const socket = socketRef.current;

    // Expose socket globally for debugging
    (window as any).debugSocket = socket;

    // Handle connection
    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket server");

      // Authenticate user with server
      socket.emit("authenticate", {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      });

      // Dispatch event for debug panel
      window.dispatchEvent(new CustomEvent("ws-connect"));

      onConnect?.();
    });

    // Handle ping from server
    socket.on("ping", (data) => {
      console.log("📡 Received ping from server:", data);
      // Respond with pong
      socket.emit("pong", {
        timestamp: new Date().toISOString(),
        userId: user.id,
      });
      // Dispatch event for debug panel
      window.dispatchEvent(new CustomEvent("ws-ping"));
    });

    // Handle authentication confirmation
    socket.on("authenticated", (data) => {
      console.log("🔑 Authentication confirmed:", data);
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log("🔴 Disconnected from WebSocket server:", reason);
      // Dispatch event for debug panel
      window.dispatchEvent(new CustomEvent("ws-disconnect"));
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
      console.error("❌ WebSocket connection error:", error);
      console.log("🔄 Will retry connection automatically...");
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
