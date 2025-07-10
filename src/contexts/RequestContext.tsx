import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useWebSocket } from "../hooks/useWebSocket";

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

  // Handle real-time request updates
  const handleRequestUpdate = useCallback((data: any) => {
    console.log("Received request update:", data);

    if (data.type === "REQUEST_UPDATE") {
      const updatedRequest = data.request;

      setRequests((prevRequests) => {
        const existingIndex = prevRequests.findIndex(
          (req) => req.id === updatedRequest.id
        );

        if (existingIndex >= 0) {
          // Update existing request
          const newRequests = [...prevRequests];
          newRequests[existingIndex] = updatedRequest;
          return newRequests;
        } else {
          // Add new request if it doesn't exist
          return [...prevRequests, updatedRequest];
        }
      });
    }
  }, []);

  // Initialize WebSocket connection
  useWebSocket({
    onRequestUpdate: handleRequestUpdate,
    onConnect: () => console.log("RequestContext: WebSocket connected"),
    onDisconnect: () => console.log("RequestContext: WebSocket disconnected"),
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
