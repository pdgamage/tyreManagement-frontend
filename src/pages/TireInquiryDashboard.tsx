import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrls, API_CONFIG } from "../config/api";
import { Calendar, FileText, ArrowLeft, Search, Car, Package, AlertCircle } from "lucide-react";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  brand?: string;
  model?: string;
}

interface RequestDetail {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber?: string;
  supplierName?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  created_at: string;
  submittedAt: string;
  tireSize?: string;
  tireSizeRequired?: string;
  quantity?: number;
  tubesQuantity?: number;
  requestReason?: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  lastReplacementDate?: string;
  existingTireMake?: string;
  presentKmReading?: number;
  previousKmReading?: number;
  tireWearPattern?: string;
  userSection?: string;
  costCenter?: string;
  supervisor_notes?: string;
  technical_manager_note?: string;
  engineer_note?: string;
  customer_officer_note?: string;
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

  // Fetch requests for selected vehicle
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
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch requests");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests for report (date range)
  const handleReportSearch = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${apiUrls.requests()}?startDate=${dateFrom}&endDate=${dateTo}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch report data");
      const data = await res.json();
      // Filter by date range on frontend as well
      const filteredData = data.filter((req: RequestDetail) => {
        const requestDate = new Date(req.created_at || req.submittedAt);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        return requestDate >= fromDate && requestDate <= toDate;
      });
      setReportResults(Array.isArray(filteredData) ? filteredData : []);
    } catch (err) {
      setError("Failed to fetch report data");
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "complete":
      case "order placed":
        return "bg-green-100 text-green-800";
      case "supervisor approved":
      case "technical-manager approved":
      case "engineer approved":
      case "customer-officer approved":
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "supervisor rejected":
      case "technical-manager rejected":
      case "engineer rejected":
      case "customer-officer rejected":
      case "rejected":
        return "bg-red-100 text-red-800";
      case "order cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                    {v.vehicleNumber} {v.brand && v.model ? `(${v.brand} ${v.model})` : ""}
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
              <div className="space-y-6">
                {requests.map((req) => (
                  <div key={req.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Request Information */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">Request #{req.id}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Number</label>
                            <p className="text-sm font-semibold text-gray-900">{req.orderNumber || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Requested Date</label>
                            <p className="text-sm font-semibold text-gray-900">{formatDate(req.created_at || req.submittedAt)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tire Size</label>
                            <p className="text-sm font-semibold text-gray-900">{req.tireSize || req.tireSizeRequired || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
                            <p className="text-sm font-semibold text-gray-900">{req.quantity || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tubes Quantity</label>
                            <p className="text-sm font-semibold text-gray-900">{req.tubesQuantity || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Request Reason</label>
                            <p className="text-sm font-semibold text-gray-900">{req.requestReason || "-"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Supplier & Vehicle Information */}
                      <div className="space-y-4">
                        <h5 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span>Supplier Information</span>
                        </h5>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Supplier Name</label>
                            <p className="text-sm font-semibold text-gray-900">{req.supplierName || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Supplier Phone</label>
                            <p className="text-sm font-semibold text-gray-900">{req.supplierPhone || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Supplier Email</label>
                            <p className="text-sm font-semibold text-gray-900">{req.supplierEmail || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Section */}
              <div className="mt-8 bg-gray-100 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary</h4>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b py-2 px-4 text-sm font-medium text-gray-700">Order Number</th>
                      <th className="border-b py-2 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="border-b py-2 px-4 text-sm font-medium text-gray-700">Supplier Name</th>
                      <th className="border-b py-2 px-4 text-sm font-medium text-gray-700">Supplier Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td className="border-b py-2 px-4 text-sm text-gray-900">{req.orderNumber || "-"}</td>
                        <td className="border-b py-2 px-4 text-sm text-gray-900">{req.status || "-"}</td>
                        <td className="border-b py-2 px-4 text-sm text-gray-900">{req.supplierName || "-"}</td>
                        <td className="border-b py-2 px-4 text-sm text-gray-900">{req.supplierPhone || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedVehicle && requests.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No requests found for the selected vehicle.</p>
            </div>
          )}
        </div>

        {/* Report Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-900">Tire Request Report</h2>
              <p className="text-green-700 text-sm">Generate reports based on tire request data</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <button
              onClick={handleReportSearch}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:shadow-lg transition-all flex items-center space-x-2"
              disabled={!dateFrom || !dateTo || loading}
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Generating..." : "Generate Report"}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {reportResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Report Results from {formatDate(dateFrom)} to {formatDate(dateTo)}
              </h3>
              <div className="space-y-6">
                {reportResults.map(req => (
                  <div key={req.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Request Information */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">Request #{req.id}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Number</label>
                            <p className="text-sm font-semibold text-gray-900">{req.orderNumber || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Requested Date</label>
                            <p className="text-sm font-semibold text-gray-900">{formatDate(req.created_at || req.submittedAt)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tire Size</label>
                            <p className="text-sm font-semibold text-gray-900">{req.tireSize || req.tireSizeRequired || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
                            <p className="text-sm font-semibold text-gray-900">{req.quantity || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tubes Quantity</label>
                            <p className="text-sm font-semibold text-gray-900">{req.tubesQuantity || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Request Reason</label>
                            <p className="text-sm font-semibold text-gray-900">{req.requestReason || "-"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Supplier & Vehicle Information */}
                      <div className="space-y-4">
                        <h5 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span>Supplier Information</span>
                        </h5>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Supplier Name</label>
                            <p className="text-sm font-semibold text-gray-900">{req.supplierName || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Supplier Phone</label>
                            <p className="text-sm font-semibold text-gray-900">{req.supplierPhone || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Supplier Email</label>
                            <p className="text-sm font-semibold text-gray-900">{req.supplierEmail || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Section */}
              <div className="mt-8 bg-gray-100 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary</h4>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b py-2 px-4 text-sm font-medium text-gray-700">Order Number</th>
                      <th className="border-b py-2 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="border-b py-2 px-4 text-sm font-medium text-gray-700">Supplier Name</th>
                      <th className="border-b py-2 px-4 text-sm font-medium text-gray-700">Supplier Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td className="border-b py-2 px-4 text-sm text-gray-900">{req.orderNumber || "-"}</td>
                        <td className="border-b py-2 px-4 text-sm text-gray-900">{req.status || "-"}</td>
                        <td className="border-b py-2 px-4 text-sm text-gray-900">{req.supplierName || "-"}</td>
                        <td className="border-b py-2 px-4 text-sm text-gray-900">{req.supplierPhone || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dateFrom && dateTo && reportResults.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No report data found for the selected date range.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TireInquiryDashboard;