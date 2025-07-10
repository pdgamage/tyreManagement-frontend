import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface SSEHookProps {
  onRequestUpdate?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useSSE = ({ 
  onRequestUpdate, 
  onConnect, 
  onDisconnect 
}: SSEHookProps = {}) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) return;

    // Create SSE connection
    const eventSource = new EventSource(`${API_BASE_URL}/api/sse/events`);
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.onopen = () => {
      console.log('SSE connection opened');
      onConnect?.();
    };

    // Handle messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);
        
        if (data.type === 'REQUEST_UPDATE') {
          onRequestUpdate?.(data);
        } else if (data.type === 'CONNECTED') {
          console.log('SSE connected successfully');
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      
      // Check if connection is closed
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE connection closed');
        onDisconnect?.();
      }
    };

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
        eventSourceRef.current = null;
        console.log('SSE connection closed');
      }
    };
  }, [user, onRequestUpdate, onConnect, onDisconnect]);

  return {
    eventSource: eventSourceRef.current,
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN
  };
};
