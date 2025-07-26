import React, { createContext, useContext, useState, useCallback } from "react";
import { usePolling } from "../hooks/usePolling";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://tyremanagement-backend-production-8fed.up.railway.app";

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
  updateRequest: (id: string, requestData: any) => Promise<void>;
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

  // WebSocket disabled - using polling only for updates

  // WebSocket disabled due to Railway compatibility issues
  // Using polling-only for real-time updates
  React.useEffect(() => {
    setWsConnected(false); // Always show as disconnected since we're not using WebSocket
  }, []);

  // SSE disabled due to Railway connection issues
  // useSSE({
  //   onRequestUpdate: handleRequestUpdate,
  //   onConnect: () => console.log("RequestContext: SSE connected"),
  //   onDisconnect: () => console.log("RequestContext: SSE disconnected"),
  // });

  // Aggressive polling for real-time updates (WebSocket disabled)
  usePolling({
    onPoll: fetchRequests,
    interval: 1500, // Poll every 1.5 seconds for near real-time updates
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

  const updateRequest = useCallback(
    async (id: string, requestData: any) => {
      try {
        const formData = new FormData();

        // Add all request data to FormData
        Object.keys(requestData).forEach(key => {
          if (key === 'images') {
            // Handle images separately
            if (Array.isArray(requestData.images)) {
              requestData.images.forEach((image: any, index: number) => {
                if (image instanceof File) {
                  formData.append('images', image);
                } else if (typeof image === 'string' && image) {
                  // For existing image URLs, we'll handle them in the backend
                  formData.append(`existingImage_${index}`, image);
                }
              });
            }
          } else if (requestData[key] !== null && requestData[key] !== undefined) {
            formData.append(key, requestData[key].toString());
          }
        });

        const res = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
          method: "PUT",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to update request");
        }

        // Refresh requests after update
        await fetchRequests();
      } catch (err) {
        console.error("Error updating request:", err);
        throw err;
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
    updateRequest,
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
