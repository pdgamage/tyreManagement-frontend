import React, { createContext, useContext, useState, useCallback } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { usePolling } from "../hooks/usePolling";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://tyremanagement-backend-production.up.railway.app";

import type { Request as RequestType } from "../types/request";

type Request = RequestType;

interface RequestsContextType {
  requests: Request[];
  fetchRequests: () => Promise<void>;
  updateRequestStatus: (
    id: string,
    status: string,
    notes: string,
    role: string,
    userId?: string
  ) => Promise<void>;
  isRefreshing: boolean;
  lastUpdate: number;
  reconnectWebSocket: () => void;
  wsConnected: boolean;
}

const RequestContext = createContext<RequestsContextType | undefined>(
  undefined
);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  const fetchRequests = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/api/requests`);
      const data = await res.json();
      setRequests(data);
      setLastUpdate(Date.now());
    } catch (err) {
      setRequests([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Handle real-time request updates
  const handleRequestUpdate = useCallback(
    async (data: any) => {
      if (data.type === "REQUEST_UPDATE") {
        try {
          await fetchRequests();
        } catch (error) {
          // Error during refresh
        }
        setLastUpdate(Date.now());
      }
    },
    [fetchRequests]
  );

  // Initialize WebSocket connection
  useWebSocket({
    onRequestUpdate: handleRequestUpdate,
    onConnect: () => {
      setWsConnected(true);
    },
    onDisconnect: () => {
      setWsConnected(false);
    },
  });

  // SSE disabled due to Railway connection issues
  // useSSE({
  //   onRequestUpdate: handleRequestUpdate,
  //   onConnect: () => console.log("RequestContext: SSE connected"),
  //   onDisconnect: () => console.log("RequestContext: SSE disconnected"),
  // });

  // Dynamic polling - more aggressive when WebSocket is disconnected
  usePolling({
    onPoll: fetchRequests,
    interval: wsConnected ? 10000 : 2000, // 10s when WS connected, 2s when disconnected
    enabled: true,
  });

  const updateRequestStatus = useCallback(
    async (
      id: string,
      status: string,
      notes: string,
      role: string,
      userId?: string
    ) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/requests/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, notes, role, userId }),
        });

        if (!res.ok) {
          throw new Error("Failed to update request status");
        }

        // Refresh the requests list after update
        await fetchRequests();
      } catch (error) {
        console.error("Error updating request status:", error);
        alert("Failed to update request status. Please try again.");
      }
    },
    [fetchRequests]
  );

  // Manual reconnect function
  const reconnectWebSocket = useCallback(() => {
    // Force page reload to reset WebSocket connection
    window.location.reload();
  }, []);

  const contextValue = {
    requests,
    fetchRequests,
    updateRequestStatus,
    isRefreshing,
    lastUpdate,
    reconnectWebSocket,
    wsConnected,
  };

  return (
    <RequestContext.Provider value={contextValue}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error("useRequests must be used within a RequestProvider");
  }
  return context;
};
