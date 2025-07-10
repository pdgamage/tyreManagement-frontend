import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Wifi, WifiOff } from 'lucide-react';

const WebSocketStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  useWebSocket({
    onConnect: () => setIsConnected(true),
    onDisconnect: () => setIsConnected(false)
  });

  return (
    <div className={`flex items-center space-x-1 text-xs ${
      isConnected ? 'text-green-600' : 'text-red-600'
    }`}>
      {isConnected ? (
        <>
          <Wifi size={12} />
          <span>Live</span>
        </>
      ) : (
        <>
          <WifiOff size={12} />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};

export default WebSocketStatus;
