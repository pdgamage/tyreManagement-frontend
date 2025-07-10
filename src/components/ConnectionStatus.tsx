import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSSE } from '../hooks/useSSE';
import { Wifi, WifiOff, Radio } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const [wsConnected, setWsConnected] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);

  useWebSocket({
    onConnect: () => setWsConnected(true),
    onDisconnect: () => setWsConnected(false)
  });

  useSSE({
    onConnect: () => setSseConnected(true),
    onDisconnect: () => setSseConnected(false)
  });

  return (
    <div className="flex items-center space-x-3 text-xs">
      {/* WebSocket Status */}
      <div className={`flex items-center space-x-1 ${
        wsConnected ? 'text-green-600' : 'text-red-600'
      }`}>
        {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
        <span>WS</span>
      </div>

      {/* SSE Status */}
      <div className={`flex items-center space-x-1 ${
        sseConnected ? 'text-green-600' : 'text-red-600'
      }`}>
        <Radio size={12} />
        <span>SSE</span>
      </div>

      {/* Overall Status */}
      <div className={`px-2 py-1 rounded text-xs ${
        (wsConnected || sseConnected) 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {(wsConnected || sseConnected) ? 'Live' : 'Offline'}
      </div>
    </div>
  );
};

export default ConnectionStatus;
