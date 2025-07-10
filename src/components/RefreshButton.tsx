import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useRequests } from '../contexts/RequestContext';

const RefreshButton: React.FC = () => {
  const { fetchRequests } = useRequests();

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    fetchRequests();
  };

  return (
    <button
      onClick={handleRefresh}
      className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      title="Refresh data"
    >
      <RefreshCw size={14} />
      <span>Refresh</span>
    </button>
  );
};

export default RefreshButton;
