import React, { useState } from "react";
import axios from "axios";
import { Request } from "../types/api";

const VehicleRequestFilterSection: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch vehicle number suggestions
  const fetchSuggestions = async (val: string) => {
    try {
      const res = await axios.get(`/api/vehicles/numbers?search=${val}`);
      setSuggestions(res.data);
    } catch (err) {
      setSuggestions([]);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedVehicle(null);
    setRequests([]);
    if (val.length > 1) fetchSuggestions(val);
    else setSuggestions([]);
  };

  // Handle suggestion selection
  const handleSelect = async (vehicleNumber: string) => {
    setSelectedVehicle(vehicleNumber);
    setQuery(vehicleNumber);
    setSuggestions([]);
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/requests/vehicle/number/${vehicleNumber}`);
      setRequests(res.data);
    } catch (err) {
      setError("Failed to fetch requests for this vehicle.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg mb-6 shadow">
      <h2 className="text-xl font-bold mb-2">Filter Requests by Vehicle Number</h2>
      <div className="mb-2">
        <label className="block mb-1 font-semibold">Vehicle Number</label>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          placeholder="Type vehicle number..."
        />
        {suggestions.length > 0 && (
          <ul className="border bg-white rounded shadow mt-1 max-h-40 overflow-y-auto z-10">
            {suggestions.map((sug) => (
              <li
                key={sug}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelect(sug)}
              >
                {sug}
              </li>
            ))}
          </ul>
        )}
      </div>
      {loading && <div>Loading requests...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {selectedVehicle && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Requests for {selectedVehicle}</h3>
          {requests.length === 0 ? (
            <div>No requests found for this vehicle.</div>
          ) : (
            <table className="w-full border mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Request ID</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Submitted At</th>
                  {/* Add more columns as needed */}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="p-2 border">{req.id}</td>
                    <td className="p-2 border">{req.status}</td>
                    <td className="p-2 border">{new Date(req.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleRequestFilterSection;
