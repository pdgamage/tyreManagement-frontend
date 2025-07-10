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
}

const RequestContext = createContext<RequestsContextType | undefined>(
  undefined
);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Handle real-time request updates
  const handleRequestUpdate = useCallback(async (data: any) => {
    console.log("Received request update:", data);

    if (data.type === "REQUEST_UPDATE") {
      const updatedRequest = data.request;

      // Option 1: Update state directly
      setRequests((prevRequests) => {
        const existingIndex = prevRequests.findIndex(
          (req) => req.id === updatedRequest.id
        );

        if (existingIndex >= 0) {
          // Update existing request - create completely new array to force re-render
          const newRequests = prevRequests.map((req, index) =>
            index === existingIndex ? { ...updatedRequest } : req
          );
          console.log(
            "Updated existing request:",
            updatedRequest.id,
            "Status:",
            updatedRequest.status
          );
          return newRequests;
        } else {
          // Add new request if it doesn't exist
          console.log("Adding new request:", updatedRequest.id);
          return [...prevRequests, { ...updatedRequest }];
        }
      });

      // Option 2: Force complete refresh immediately
      console.log("Force refreshing requests after WebSocket update");
      fetchRequests();

      // Force re-render by updating timestamp
      setLastUpdate(Date.now());
    }
  }, []);

  // Initialize WebSocket connection
  useWebSocket({
    onRequestUpdate: handleRequestUpdate,
    onConnect: () => console.log("RequestContext: WebSocket connected"),
    onDisconnect: () => console.log("RequestContext: WebSocket disconnected"),
  });

  // Initialize SSE connection (more reliable for Railway)
  useSSE({
    onRequestUpdate: handleRequestUpdate,
    onConnect: () => console.log("RequestContext: SSE connected"),
    onDisconnect: () => console.log("RequestContext: SSE disconnected"),
  });

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setRequests([]);
    }
  }, []);

  // Backup polling mechanism (ensures updates even if WebSocket/SSE fails)
  usePolling({
    onPoll: fetchRequests,
    interval: 5000, // Poll every 5 seconds
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
