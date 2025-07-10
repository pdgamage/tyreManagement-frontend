import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useSSE } from "../hooks/useSSE";
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

  const fetchRequests = useCallback(async () => {
    try {
      setIsRefreshing(true);
      console.log("🔄 Fetching requests...");
      const res = await fetch(`${API_BASE_URL}/api/requests`);
      const data = await res.json();
      setRequests(data);
      setLastUpdate(Date.now());
      console.log("✅ Requests updated:", data.length, "requests");
    } catch (err) {
      console.error("❌ Failed to fetch requests:", err);
      setRequests([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Handle real-time request updates
  const handleRequestUpdate = useCallback(
    async (data: any) => {
      console.log("🔄 WEBSOCKET UPDATE RECEIVED:", data);

      if (data.type === "REQUEST_UPDATE") {
        console.log(
          "🚀 Processing REQUEST_UPDATE - Force refreshing all requests"
        );

        // Force complete refresh immediately - this should work
        try {
          await fetchRequests();
          console.log("✅ Force refresh completed successfully");
        } catch (error) {
          console.error("❌ Force refresh failed:", error);
        }

        // Also update timestamp to force re-render
        setLastUpdate(Date.now());
        console.log("🔄 Updated timestamp to force re-render");
      }
    },
    [fetchRequests]
  );

  // Initialize WebSocket connection
  useWebSocket({
    onRequestUpdate: handleRequestUpdate,
    onConnect: () => console.log("RequestContext: WebSocket connected"),
    onDisconnect: () => console.log("RequestContext: WebSocket disconnected"),
  });

  // SSE disabled due to Railway connection issues
  // useSSE({
  //   onRequestUpdate: handleRequestUpdate,
  //   onConnect: () => console.log("RequestContext: SSE connected"),
  //   onDisconnect: () => console.log("RequestContext: SSE disconnected"),
  // });

  // Aggressive polling mechanism (ensures updates even if WebSocket fails)
  usePolling({
    onPoll: fetchRequests,
    interval: 1000, // Poll every 1 second for near real-time updates
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

  const contextValue = {
    requests,
    fetchRequests,
    updateRequestStatus,
    isRefreshing,
    lastUpdate,
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
