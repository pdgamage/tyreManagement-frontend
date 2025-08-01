import React, { useState, useEffect } from "react";
import { buildApiUrl, API_CONFIG } from "../config/api";

interface Vehicle {
  id: number;
  vehicleNumber: string;
  [key: string]: any;
}

interface Request {
  id: number;
  vehicleNumber: string;
  status: string;
  submittedAt: string;
  [key: string]: any;
}

const VehicleRequestSearch: React.FC = () => {
  const [vehicleInput, setVehicleInput] = useState("");
  const [suggestions, setSuggestions] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicle suggestions as user types
  useEffect(() => {
    if (vehicleInput.length < 2) {
      setSuggestions([]);
      return;
    }
    const fetchVehicles = async () => {
      try {
        const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.VEHICLES));
        const data = await res.json();
        setSuggestions(
          data.filter((v: Vehicle) =>
            v.vehicleNumber.toLowerCase().includes(vehicleInput.toLowerCase())
          )
        );
      } catch (e) {
        setSuggestions([]);
      }
    };
    fetchVehicles();
  }, [vehicleInput]);

  // Fetch requests for selected vehicle
  const fetchRequests = async (vehicleNumber: string) => {
    setLoading(true);
    setError(null);
    setRequests([]);
    try {
      const res = await fetch(
        buildApiUrl(
          "/api/requests/vehicle-number",
          encodeURIComponent(vehicleNumber)
        )
      );
      if (!res.ok) throw new Error("No requests found");
      const data = await res.json();
      setRequests(data);
    } catch (e: any) {
      setError(e.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVehicleInput(e.target.value);
    setSelectedVehicle(null);
    setRequests([]);
    setError(null);
  };

  const handleSuggestionClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleInput(vehicle.vehicleNumber);
    fetchRequests(vehicle.vehicleNumber);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleInput && !selectedVehicle) {
      fetchRequests(vehicleInput);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Search Requests by Vehicle Number</h2>
      <form onSubmit={handleSearch} className="mb-4 relative">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
          placeholder="Enter vehicle number..."
          value={vehicleInput}
          onChange={handleInputChange}
        />
        {suggestions.length > 0 && !selectedVehicle && (
          <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 max-h-40 overflow-y-auto">
            {suggestions.map((vehicle) => (
              <li
                key={vehicle.id}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSuggestionClick(vehicle)}
              >
                {vehicle.vehicleNumber}
              </li>
            ))}
          </ul>
        )}
      </form>
      {loading && <div>Loading requests...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {requests.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Requests for {vehicleInput}:</h3>
          <table className="w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1">Request ID</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t">
                  <td className="px-2 py-1">{req.id}</td>
                  <td className="px-2 py-1">{req.status}</td>
                  <td className="px-2 py-1">{new Date(req.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VehicleRequestSearch;
