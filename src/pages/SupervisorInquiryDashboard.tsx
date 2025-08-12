import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import "../styles/scrollbar.css";
import { 
  ArrowLeft, AlertCircle, Loader2, X, Search, Car, 
  Building, FileText, ChevronDown, ChevronUp, Filter, 
  Frown, Smile, CheckCircle, Clock, XCircle, Package 
} from "lucide-react";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  brand: string;
  model: string;
}

interface TireRequest {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  requestDate: string;
  created_at?: string;
  submittedAt?: string;
  supplierName?: string;
  tireCount?: number;
  requesterName: string;
  userSection: string;
  supervisor_notes?: string;
  supervisor_decision_by?: string;
}

const statusOptions = [
  { value: "all", label: "All Statuses", icon: null },
  { value: "pending", label: "Pending", icon: <Clock className="w-4 h-4 mr-2 text-yellow-500" /> },
  { value: "supervisor approved", label: "Approved", icon: <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> },
  { value: "supervisor rejected", label: "Rejected", icon: <XCircle className="w-4 h-4 mr-2 text-red-500" /> }
];

const SupervisorInquiryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle') || '';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleFromUrl || '');
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TireRequest[]>([]);
  const [isLoading, setIsLoading] = useState({ vehicles: false, requests: false });
  const [error, setError] = useState<{ vehicles: string | null; requests: string | null }>({ vehicles: null, requests: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [dateInput, setDateInput] = useState({ startDate: '', endDate: '' });
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Fetch vehicles
  const fetchVehicles = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, vehicles: true }));
    setError(prev => ({ ...prev, vehicles: '' }));
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VEHICLES}`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(prev => ({ 
        ...prev, 
        vehicles: `Failed to load vehicles: ${err?.message || 'Unknown error'}` 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, vehicles: false }));
    }
  }, []);

  // Fetch requests
  const fetchRequests = useCallback(async (vehicleNumber?: string) => {
    setIsLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: '' }));
    try {
      const url = vehicleNumber 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPERVISOR_REQUESTS}?vehicleNumber=${encodeURIComponent(vehicleNumber)}`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPERVISOR_REQUESTS}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(prev => ({
        ...prev,
        requests: `Failed to load requests: ${err?.message || 'Unknown error'}`
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, []);

  // Initialize component
  useEffect(() => {
    fetchVehicles();
    if (vehicleFromUrl) {
      fetchRequests(vehicleFromUrl);
    }
  }, [fetchVehicles, vehicleFromUrl]);

  // Filter requests
  useEffect(() => {
    if (!requests) {
      setFilteredRequests([]);
      return;
    }

    let filtered = [...requests];

    // Apply vehicle filter
    if (selectedVehicle && selectedVehicle !== 'All Vehicles') {
      filtered = filtered.filter(request => request.vehicleNumber === selectedVehicle);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status.toLowerCase() === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.vehicleNumber.toLowerCase().includes(term) ||
        request.requesterName.toLowerCase().includes(term) ||
        request.userSection.toLowerCase().includes(term)
      );
    }

    // Apply date filter
    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.submittedAt || request.created_at || request.requestDate);
        if (dateRange.startDate) {
          const startDate = new Date(dateRange.startDate);
          if (requestDate < startDate) return false;
        }
        if (dateRange.endDate) {
          const endDate = new Date(dateRange.endDate);
          endDate.setDate(endDate.getDate() + 1);
          if (requestDate >= endDate) return false;
        }
        return true;
      });
    }

    setFilteredRequests(filtered);
  }, [requests, selectedVehicle, statusFilter, searchTerm, dateRange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedVehicle(value);
    if (value === 'All Vehicles') {
      fetchRequests();
    } else if (value) {
      fetchRequests(value);
    }
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/supervisor/request-details/${requestId}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'supervisor approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'supervisor rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Supervisor Inquiry Dashboard</h1>
                <p className="text-blue-100 opacity-90">Review and manage tire requests</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Selection */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-blue-100">
                  Filter by Vehicle
                </label>
                {isLoading.vehicles && (
                  <div className="flex items-center text-xs text-blue-200">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Loading...
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <select
                    value={selectedVehicle}
                    onChange={handleVehicleChange}
                    className="block w-full pl-3 pr-10 py-2.5 text-sm border rounded-lg bg-white/90 text-gray-900"
                  >
                    <option value="">Select Vehicle</option>
                    <option value="All Vehicles">All Vehicles</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.vehicleNumber}>
                        {vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status and Search Filters */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2.5 text-sm border rounded-lg bg-white/90 text-gray-900"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Search Requests
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className="block w-full pl-3 pr-10 py-2.5 text-sm border rounded-lg bg-white/90 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading.requests && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error.requests && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-red-700">{error.requests}</p>
            </div>
          </div>
        )}

        {/* Requests List */}
        {!isLoading.requests && !error.requests && filteredRequests.length > 0 && (
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Requests ({filteredRequests.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredRequests.map((request) => (
                <li
                  key={request.id}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => handleViewDetails(request.id)}
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            Request #{request.id}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {request.vehicleNumber} - Submitted by {request.requesterName}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Department: {request.userSection}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(request.submittedAt || request.created_at || request.requestDate)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty State */}
        {!isLoading.requests && !error.requests && filteredRequests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Frown className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedVehicle ? "No requests match your current filters." : "Select a vehicle to view requests."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SupervisorInquiryDashboard;
