import React from 'react';
import { useRequests } from '../contexts/RequestContext';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

const LiveUpdateStatus: React.FC = () => {
  const { isRefreshing, lastUpdate } = useRequests();

  const formatLastUpdate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return `${seconds}s ago`;
    } else {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-600">
      {/* Refresh indicator */}
      <div className={`flex items-center space-x-1 ${
        isRefreshing ? 'text-blue-600' : 'text-green-600'
      }`}>
        <RefreshCw 
          size={12} 
          className={isRefreshing ? 'animate-spin' : ''} 
        />
        <span>{isRefreshing ? 'Updating...' : 'Live'}</span>
      </div>

      {/* Last update time */}
      <span className="text-gray-500">
        Updated {formatLastUpdate(lastUpdate)}
      </span>

      {/* Auto-refresh indicator */}
      <div className="flex items-center space-x-1 text-green-600">
        <Wifi size={12} />
        <span>Auto</span>
      </div>
    </div>
  );
};

export default LiveUpdateStatus;
