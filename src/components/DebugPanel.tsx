import React, { useState, useEffect } from "react";
import { useRequests } from "../contexts/RequestContext";
import { RefreshCw, Wifi, WifiOff, AlertCircle, Zap } from "lucide-react";
import { io } from "socket.io-client";

const DebugPanel: React.FC = () => {
  const { fetchRequests, isRefreshing, lastUpdate } = useRequests();
  const [wsConnected, setWsConnected] = useState(false);
  const [lastPing, setLastPing] = useState<number>(0);

  // Listen for WebSocket events
  useEffect(() => {
    const handleConnect = () => setWsConnected(true);
    const handleDisconnect = () => setWsConnected(false);
    const handlePing = () => setLastPing(Date.now());

    // Add event listeners to window for WebSocket events
    window.addEventListener("ws-connect", handleConnect);
    window.addEventListener("ws-disconnect", handleDisconnect);
    window.addEventListener("ws-ping", handlePing);

    return () => {
      window.removeEventListener("ws-connect", handleConnect);
      window.removeEventListener("ws-disconnect", handleDisconnect);
      window.removeEventListener("ws-ping", handlePing);
    };
  }, []);

  const handleManualRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    fetchRequests();
  };

  const handleTestConnection = () => {
    console.log("🧪 Testing WebSocket connection...");
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    const testSocket = io(API_BASE_URL, {
      transports: ["polling"],
      timeout: 10000,
      forceNew: true,
      autoConnect: true,
      withCredentials: false,
    });

    testSocket.on("connect", () => {
      console.log("✅ Test connection successful!");
      testSocket.disconnect();
    });

    testSocket.on("connect_error", (error) => {
      console.error("❌ Test connection failed:", error);
      testSocket.disconnect();
    });

    setTimeout(() => {
      testSocket.disconnect();
    }, 10000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="p-3 bg-gray-100 border rounded-lg">
      <h3 className="mb-2 text-sm font-semibold">Debug Panel</h3>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>WebSocket:</span>
          <div
            className={`flex items-center space-x-1 ${
              wsConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{wsConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Status:</span>
          <span className={isRefreshing ? "text-blue-600" : "text-green-600"}>
            {isRefreshing ? "Refreshing..." : "Ready"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Last Update:</span>
          <span className="text-gray-600">{formatTime(lastUpdate)}</span>
        </div>

        <div className="space-y-1">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center w-full px-2 py-1 space-x-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw
              size={12}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span>Force Refresh</span>
          </button>

          <button
            onClick={handleTestConnection}
            className="flex items-center justify-center w-full px-2 py-1 space-x-1 text-xs text-white bg-orange-500 rounded hover:bg-orange-600"
          >
            <Zap size={12} />
            <span>Test WebSocket</span>
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Auto-refresh: Every 1 second
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
