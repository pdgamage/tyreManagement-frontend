import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { API_CONFIG } from "../config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;

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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingRef = useRef<number>(Date.now());
  const [isConnected, setIsConnected] = useState(false);

  const forceReconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Clear any existing timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Reconnect after a short delay
    reconnectTimeoutRef.current = setTimeout(() => {
      if (user) {
        // Trigger re-initialization
        window.location.reload();
      }
    }, 3000);
  }, [user]);

  const startHealthCheck = useCallback(() => {
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
    }

    healthCheckRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastPing = now - lastPingRef.current;

      // If no ping received in 60 seconds, force reconnect
      if (timeSinceLastPing > 60000) {
        forceReconnect();
      }
    }, 30000); // Check every 30 seconds
  }, [forceReconnect]);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) return;

    // Initialize socket connection with robust reconnection
    socketRef.current = io(API_BASE_URL, {
      transports: ["polling"], // Use only polling for Railway
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity, // Keep trying forever
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
      forceNew: false,
      autoConnect: true,
      withCredentials: false,
    });

    const socket = socketRef.current;

    // Handle connection
    socket.on("connect", () => {
      setIsConnected(true);

      // Authenticate user with server
      socket.emit("authenticate", {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      });

      // Start health monitoring
      startHealthCheck();
      lastPingRef.current = Date.now();

      onConnect?.();
    });

    // Handle ping from server
    socket.on("ping", (data) => {
      // Update last ping time for health check
      lastPingRef.current = Date.now();

      // Respond with pong
      socket.emit("pong", {
        timestamp: new Date().toISOString(),
        userId: user.id,
      });
    });

    // Handle authentication confirmation
    socket.on("authenticated", () => {
      setIsConnected(true); // Ensure we're marked as connected after auth
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      setIsConnected(false);
      onDisconnect?.();
    });

    // Handle request updates
    socket.on("requestUpdate", (data) => {
      if (onRequestUpdate) {
        onRequestUpdate(data);
      }
    });

    // Handle reconnection
    socket.on("reconnect", () => {
      setIsConnected(true);
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

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }

      // Clear timeouts and intervals
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
      }
    };
  }, [user, onRequestUpdate, onConnect, onDisconnect, startHealthCheck]);

  // Function to manually emit events
  const emit = (eventName: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data);
    }
  };

  return {
    socket: socketRef.current,
    emit,
    isConnected: isConnected && socketRef.current?.connected,
  };
};
