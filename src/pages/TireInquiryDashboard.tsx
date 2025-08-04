import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrls, API_CONFIG } from "../config/api";
import { FileText, ArrowLeft, Search, AlertCircle, Car } from "lucide-react";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  brand?: string;
  model?: string;
}

interface RequestDetail {
  id: string;
  orderNumber: string;
  status: string;
  supplierName: string;
  supplierPhone: string;
}

const TireInquiryDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [requests, setRequests] = useState<RequestDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch(apiUrls.vehicles());
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const data = await res.json();
        setVehicles(data);
      } catch (err) {
        setError("Failed to load vehicles");
        console.error("Error fetching vehicles:", err);
      }
    };
    fetchVehicles();
  }, []);

  const handleSearch = async () => {
    if (!selectedVehicle) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${API_CONFIG.BASE_URL}/api/requests/vehicle/${encodeURIComponent(selectedVehicle)}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          setRequests([]);
          return;
        }
        throw new Error("Failed to fetch requests");
      }
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError("Failed to fetch requests");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 shadow-2xl border-b border-slate-200">
        <div className="px-4 py-8 mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Tire Inquiry Dashboard</h1>
              <p className="text-slate-300 text-base font-medium mt-1">Search and report on tire requests by vehicle</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/user")}
            className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="px-4 py-10 mx-auto max-w-7xl">
        {/* Vehicle Inquiry Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">Vehicle Request Inquiry</h2>
              <p className="text-blue-700 text-sm">Select a vehicle to view all tire requests and their details</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle Number</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={selectedVehicle}
                onChange={e => setSelectedVehicle(e.target.value)}
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.vehicleNumber}>
                    {v.vehicleNumber} {v.brand && v.model ? `(${v.brand} ${v.model})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:shadow-lg transition-all flex items-center space-x-2"
              disabled={!selectedVehicle || loading}
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Searching..." : "Search"}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {requests.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Request Details for Vehicle: {selectedVehicle}
              </h3>
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Order Number</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Supplier Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Supplier Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-sm text-gray-900">{req.orderNumber}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{req.status}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{req.supplierName}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{req.supplierPhone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedVehicle && requests.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No requests found for vehicle {selectedVehicle}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TireInquiryDashboard;