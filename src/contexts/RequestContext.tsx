import React, { createContext, useContext, useState, useCallback } from "react";
import { usePolling } from "../hooks/usePolling";
import { apiUrls } from "../config/api";
import { useMsal } from "@azure/msal-react";
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
  const { instance, accounts } = useMsal();
  const [requests, setRequests] = useState<Request[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  const fetchRequests = useCallback(async () => {
    try {
      setIsRefreshing(true);
      if (!accounts[0]) {
        throw new Error('No active account! Please sign in first.');
      }

      const tokenRequest = {
        scopes: ["openid", "profile", "email"],
        account: accounts[0]
      };

      const token = await instance.acquireTokenSilent(tokenRequest);
      
      const res = await fetch(apiUrls.requests(), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`,
        },
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setRequests(data);
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequests([]);
      // If the token is expired or invalid, try to acquire it again
      if (err instanceof Error && err.name === "InteractionRequiredAuthError") {
        instance.acquireTokenRedirect({
          scopes: ["openid", "profile", "email"]
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [instance, accounts]);

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
        if (!accounts[0]) {
          throw new Error('No active account! Please sign in first.');
        }

        const tokenRequest = {
          scopes: ["openid", "profile", "email"],
          account: accounts[0]
        };

        const token = await instance.acquireTokenSilent(tokenRequest);

        const res = await fetch(`${apiUrls.requestById(id)}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.accessToken}`,
          },
          credentials: 'include',
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
        // If the token is expired or invalid, try to acquire it again
        if (error instanceof Error && error.name === "InteractionRequiredAuthError") {
          instance.acquireTokenRedirect({
            scopes: ["openid", "profile", "email"]
          });
        }
      }
    },
    [fetchRequests, instance, accounts]
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
