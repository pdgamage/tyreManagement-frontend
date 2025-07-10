import React from 'react';
import { useRequests } from '../contexts/RequestContext';
import { RefreshCw, Zap } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const { fetchRequests, isRefreshing, lastUpdate } = useRequests();

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchRequests();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-gray-100 p-3 rounded-lg border">
      <h3 className="text-sm font-semibold mb-2">Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <span className={isRefreshing ? 'text-blue-600' : 'text-green-600'}>
            {isRefreshing ? 'Refreshing...' : 'Ready'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Last Update:</span>
          <span className="text-gray-600">
            {formatTime(lastUpdate)}
          </span>
        </div>
        
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Force Refresh</span>
        </button>
        
        <div className="text-xs text-gray-500 mt-2">
          Auto-refresh: Every 1 second
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
