import { useEffect, useRef } from 'react';

interface PollingHookProps {
  onPoll: () => void;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export const usePolling = ({ 
  onPoll, 
  interval = 3000, // 3 seconds default
  enabled = true 
}: PollingHookProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling
    intervalRef.current = setInterval(() => {
      onPoll();
    }, interval);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onPoll, interval, enabled]);

  // Manual trigger function
  const triggerPoll = () => {
    onPoll();
  };

  return { triggerPoll };
};
