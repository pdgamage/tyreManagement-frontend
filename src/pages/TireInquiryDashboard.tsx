import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrls } from "../config/api";
import { Calendar, FileText, ArrowLeft } from "lucide-react";

interface Vehicle {
  id: string;
  vehicleNumber: string;
}

interface RequestDetail {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber?: string;
  supplierName?: string;
  supplierNumber?: string;
  requestedAt: string;
  tireType?: string;
  quantity?: number;
  remarks?: string;
  [key: string]: any;
}

const TireInquiryDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [requests, setRequests] = useState<RequestDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportResults, setReportResults] = useState<RequestDetail[]>([]);
  const navigate = useNavigate();

  // Fetch all registered vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch(apiUrls.vehicles);
        const data = await res.json();
        setVehicles(data);
      } catch (err) {
        setError("Failed to load vehicles");
      }
    };
    fetchVehicles();
  }, []);

  // Fetch requests for selected vehicle
  const handleSearch = async () => {
    if (!selectedVehicle) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrls.requests + `?vehicleNumber=${selectedVehicle}`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError("Failed to fetch requests");
    }
    setLoading(false);
  };

  // Fetch requests for report (date range)
  const handleReportSearch = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrls.requests + `?from=${dateFrom}&to=${dateTo}`);
      const data = await res.json();
      setReportResults(data);
    } catch (err) {
      setError("Failed to fetch report data");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 shadow-2xl border-b border-slate-200">
        <div className="px-4 py-8 mx-auto max-w-4xl flex items-center justify-between">
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
            onClick={() => navigate("/user/dashboard")}
            className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </header>
      <main className="px-4 py-10 mx-auto max-w-4xl">
        {/* Vehicle Inquiry Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-10">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Vehicle Request Inquiry</h2>
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle Number</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedVehicle}
                onChange={e => setSelectedVehicle(e.target.value)}
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.vehicleNumber}>{v.vehicleNumber}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:shadow-lg transition-all"
              disabled={!selectedVehicle || loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {requests.length > 0 && (
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Order #</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Supplier Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Supplier Number</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Requested At</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Tire Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} className="border-t border-gray-100 hover:bg-blue-50">
                      <td className="px-4 py-2 text-sm">{req.orderNumber || "-"}</td>
                      <td className="px-4 py-2 text-sm font-semibold">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          req.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : req.status === "complete"
                            ? "bg-green-100 text-green-800"
                            : req.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{req.supplierName || "-"}</td>
                      <td className="px-4 py-2 text-sm">{req.supplierNumber || "-"}</td>
                      <td className="px-4 py-2 text-sm">{new Date(req.requestedAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm">{req.tireType || "-"}</td>
                      <td className="px-4 py-2 text-sm">{req.quantity || "-"}</td>
                      <td className="px-4 py-2 text-sm">{req.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Request Report by Date Range
          </h2>
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <button
              onClick={handleReportSearch}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:shadow-lg transition-all"
              disabled={!dateFrom || !dateTo || loading}
            >
              {loading ? "Filtering..." : "Filter"}
            </button>
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {reportResults.length > 0 && (
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Order #</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Vehicle</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Supplier Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Supplier Number</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Requested At</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Tire Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {reportResults.map(req => (
                    <tr key={req.id} className="border-t border-gray-100 hover:bg-blue-50">
                      <td className="px-4 py-2 text-sm">{req.orderNumber || "-"}</td>
                      <td className="px-4 py-2 text-sm">{req.vehicleNumber || "-"}</td>
                      <td className="px-4 py-2 text-sm font-semibold">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          req.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : req.status === "complete"
                            ? "bg-green-100 text-green-800"
                            : req.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{req.supplierName || "-"}</td>
                      <td className="px-4 py-2 text-sm">{req.supplierNumber || "-"}</td>
                      <td className="px-4 py-2 text-sm">{new Date(req.requestedAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm">{req.tireType || "-"}</td>
                      <td className="px-4 py-2 text-sm">{req.quantity || "-"}</td>
                      <td className="px-4 py-2 text-sm">{req.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TireInquiryDashboard;
