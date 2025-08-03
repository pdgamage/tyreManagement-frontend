import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useVehicles } from "../contexts/VehicleContext";
import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  LogOut,
  Search as SearchIcon,
  Calendar,
  FileText,
  Activity,
  AlertCircle,
} from "lucide-react";

const TireInquiryDashboard = () => {
  const { user, logout } = useAuth();
  const { vehicles } = useVehicles();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [inquiryResults, setInquiryResults] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportResults, setReportResults] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInquirySearch = async () => {
    if (!selectedVehicle) return;

    try {
      const response = await fetch(`/api/requests/vehicle/${selectedVehicle}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const userRequests = data.filter((req: any) => req.user_id === user?.id);
      setInquiryResults(userRequests);
    } catch (err) {
      console.error(err);
      setInquiryResults([]);
    }
  };

  const handleReportSearch = async () => {
    if (!startDate || !endDate) return;

    try {
      const response = await fetch(
        `/api/requests/user/${user?.id}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setReportResults(data);
    } catch (err) {
      console.error(err);
      setReportResults([]);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
                <SearchIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Tire Inquiry Dashboard
                </h1>
                <p className="text-slate-300 text-lg font-medium mt-1">
                  Inquire about your tire requests by vehicle or date range
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400 font-medium">
                    User Level Access
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-sm text-slate-400">
                    Welcome back, {user?.name || "User"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <div className="text-xs text-slate-300 font-medium">
                    Current Time
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {currentTime.toLocaleTimeString()}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <div className="text-xs text-slate-300 font-medium">
                    Today's Date
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {currentTime.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">
                    {user?.name || "User"}
                  </div>
                  <div className="text-xs text-slate-300">User</div>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20 hover:shadow-xl transition-all duration-200"
                  >
                    <UserCircle className="w-6 h-6 text-white" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 w-48 py-1 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-6">
        <div className="space-y-12">
          {/* Vehicle Inquiry Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <SearchIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">
                    Vehicle Tire Request Inquiry
                  </h2>
                  <p className="text-blue-700 text-sm">
                    Select a vehicle number to view associated tire requests
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex space-x-4 mb-6">
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Vehicle Number</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.vehicle_number}>
                      {vehicle.vehicle_number}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleInquirySearch}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <SearchIcon className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
              {inquiryResults.length > 0 ? (
                <div className="space-y-6">
                  {inquiryResults.map((request) => (
                    <div
                      key={request.id}
                      className="bg-gray-50 p-6 rounded-xl border border-gray-200"
                    >
                      <h3 className="text-lg font-semibold mb-4">Request ID: {request.id}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <p className="text-gray-900">{request.status}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Order Number</label>
                          <p className="text-gray-900">{request.orderNumber || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Supplier Name</label>
                          <p className="text-gray-900">{request.supplierName || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Supplier Phone</label>
                          <p className="text-gray-900">{request.supplierPhone || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Submitted At</label>
                          <p className="text-gray-900">{new Date(request.submittedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Quantity</label>
                          <p className="text-gray-900">{request.quantity}</p>
                        </div>
                        {/* Add more fields as needed */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No requests found for this vehicle</p>
                </div>
              )}
            </div>
          </div>

          {/* Report Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-8 py-6 border-b border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-purple-900">
                    Request Report by Date Range
                  </h2>
                  <p className="text-purple-700 text-sm">
                    Select a date range to view your tire requests
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex space-x-4 mb-6">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  onClick={handleReportSearch}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <SearchIcon className="w-5 h-5" />
                  <span>Generate Report</span>
                </button>
              </div>
              {reportResults.length > 0 ? (
                <div className="space-y-6">
                  {reportResults.map((request) => (
                    <div
                      key={request.id}
                      className="bg-gray-50 p-6 rounded-xl border border-gray-200"
                    >
                      <h3 className="text-lg font-semibold mb-4">Request ID: {request.id} - Vehicle: {request.vehicleNumber}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <p className="text-gray-900">{request.status}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Order Number</label>
                          <p className="text-gray-900">{request.orderNumber || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Supplier Name</label>
                          <p className="text-gray-900">{request.supplierName || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Supplier Phone</label>
                          <p className="text-gray-900">{request.supplierPhone || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Submitted At</label>
                          <p className="text-gray-900">{new Date(request.submittedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Quantity</label>
                          <p className="text-gray-900">{request.quantity}</p>
                        </div>
                        {/* Add more fields as needed */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No requests found in this date range</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TireInquiryDashboard;
