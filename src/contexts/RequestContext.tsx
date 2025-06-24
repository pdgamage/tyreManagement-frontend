import React, { createContext, useContext, useState, useCallback } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

import type { Request as RequestType } from '../types/request';

type Request = RequestType;

interface RequestsContextType {
  requests: Request[];
  fetchRequests: () => Promise<void>;
  updateRequestStatus: (id: string, status: string, notes: string) => Promise<void>;
}

const RequestContext = createContext<RequestsContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>([]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setRequests([]);
    }
  }, []);

  const updateRequestStatus = useCallback(async (id: string, status: string, notes: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update request status');
      }

      // Refresh the requests list after update
      await fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update request status. Please try again.');
    }
  }, [fetchRequests]);

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
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
