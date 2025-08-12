import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import "../styles/scrollbar.css";
import { 
  ArrowLeft, AlertCircle, Loader2, X, Search, Car, 
  Building, FileText, ChevronDown, ChevronUp, Filter, 
  Frown, Smile, CheckCircle, Clock, XCircle, Package 
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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
  userId: string;
  supervisor_notes?: string;
  supervisor_decision_by?: string;
  supervisor_approved_date?: string;
  supervisor_rejected_date?: string;
  technical_manager_notes?: string;
  technical_manager_decision_by?: string;
  technical_manager_approved_date?: string;
  technical_manager_rejected_date?: string;
  engineer_notes?: string;
  engineer_approved_date?: string;
  engineer_rejected_date?: string;
  engineer_decision_by?: string;
}

const statusOptions = [
  { value: "all", label: "All Statuses", icon: null },
  { value: "pending", label: "Pending", icon: <Clock className="w-4 h-4 mr-2 text-yellow-500" /> },
  { value: "approved", label: "Supervisor Approved", icon: <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> },
  { value: "rejected", label: "Supervisor Rejected", icon: <XCircle className="w-4 h-4 mr-2 text-red-500" /> },
  { value: "order placed", label: "Order Placed", icon: <Package className="w-4 h-4 mr-2 text-purple-500" /> },
  { value: "complete", label: "Complete - Engineer Approved", icon: <Smile className="w-4 h-4 mr-2 text-blue-500" /> }
];

const SupervisorInquiryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle') || '';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleFromUrl || '');
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TireRequest[]>([]);
  const { user } = useAuth();
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
  
  // Handle error state updates safely
  const updateError = useCallback((field: 'vehicles' | 'requests', message: string) => {
    setError(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  // Fetch vehicles
  const fetchVehicles = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, vehicles: true }));
    setError(prev => ({ ...prev, vehicles: '' }));
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VEHICLES}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch vehicles: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Expected an array of vehicles but received something else');
      }
      setVehicles(data);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      updateError('vehicles', `Failed to load vehicles: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(prev => ({ ...prev, vehicles: false }));
    }
  }, []);

  // Fetch requests
  const fetchRequests = useCallback(async (vehicleNumber?: string) => {
    setIsLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: '' }));
    
    try {
      const baseUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}`;
      const queryParams = new URLSearchParams();
      
      if (user?.id) {
        queryParams.append('supervisorId', user.id);
      }
      
      if (vehicleNumber && vehicleNumber !== 'All Vehicles') {
        queryParams.append('vehicleNumber', vehicleNumber);
      }

      const finalUrl = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;
      
      const response = await fetch(finalUrl, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      const requests = Array.isArray(data) ? data : [];
      
      // Sort requests by date (newest first)
      const sortedRequests = requests.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.created_at || a.requestDate).getTime();
        const dateB = new Date(b.submittedAt || b.created_at || b.requestDate).getTime();
        return dateB - dateA;
      });
      
      setRequests(sortedRequests);
      updateError('requests', '');
    } catch (err: unknown) {
      console.error('Error fetching requests:', err);
      updateError('requests', `Failed to load requests: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, [user?.id]);

  // Initialize component and handle fetch retries
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchVehicles();
        if (vehicleFromUrl) {
          await fetchRequests(vehicleFromUrl);
        } else {
          await fetchRequests(); // Fetch all requests if no vehicle specified
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Implement retry logic if needed
      }
    };
    
    loadData();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (!isLoading.requests && !isLoading.vehicles) {
        loadData();
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [fetchVehicles, fetchRequests, vehicleFromUrl]);

  // Filter requests based on all criteria
  useEffect(() => {
    if (!requests || !Array.isArray(requests)) {
      console.log('No requests or invalid requests array');
      setFilteredRequests([]);
      return;
    }
    
    console.log('Applying filters to requests:', requests.length, 'requests');
    console.log('Current filters - search:', searchTerm, 'status:', statusFilter, 'vehicle:', selectedVehicle, 'dateRange:', dateRange);
    
    let filtered = [...requests].filter(request => {
      // Skip if request is invalid
      if (!request || typeof request !== 'object') return false;
      
      // Apply vehicle filter
      if (selectedVehicle === 'Select Vehicle') {
        // Show no requests when 'Select Vehicle' is selected
        return false;
      } else if (selectedVehicle && selectedVehicle !== 'All Vehicles' && request.vehicleNumber !== selectedVehicle) {
        // When a specific vehicle is selected, only show matching requests
        return false;
      }
      
      // Apply date range filter if dates are selected
      if (dateRange.startDate || dateRange.endDate) {
        try {
          const requestDate = request.submittedAt || request.requestDate || request.created_at;
          if (!requestDate) return false;
          
          const requestDateObj = new Date(requestDate);
          if (isNaN(requestDateObj.getTime())) {
            console.log('Skipping request due to invalid date:', request.id, requestDate);
            return false;
          }
          
          // Normalize to local date (ignoring time)
          const requestDateLocal = new Date(
            requestDateObj.getFullYear(),
            requestDateObj.getMonth(),
            requestDateObj.getDate()
          );
          
          if (dateRange.startDate) {
            const [year, month, day] = dateRange.startDate.split('-').map(Number);
            const startDate = new Date(year, month - 1, day);
            if (requestDateLocal < startDate) {
              return false;
            }
          }
          
          if (dateRange.endDate) {
            const [year, month, day] = dateRange.endDate.split('-').map(Number);
            const endDate = new Date(year, month - 1, day + 1);
            if (requestDateLocal >= endDate) {
              return false;
            }
          }
          
        } catch (error) {
          console.error('Error processing date filter:', error, 'Request ID:', request.id);
          return false;
        }
      }
      
      // Apply status filter
      if (statusFilter !== "all") {
        const requestStatus = (request.status || '').toLowerCase();
        const statusFilterLower = statusFilter.toLowerCase();
        
        // Handle supervisor-specific statuses
        if (statusFilterLower === 'approved') {
          if (!requestStatus.includes('supervisor approved')) {
            return false;
          }
        } 
        else if (statusFilterLower === 'rejected') {
          if (!requestStatus.includes('supervisor rejected')) {
            return false;
          }
        }
        // Handle general statuses
        else if (!requestStatus.includes(statusFilterLower)) {
          return false;
        }
      }
      
      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const searchableFields = [
          request.orderNumber,
          request.id.toString(),
          request.supplierName,
          request.requesterName,
          request.userSection,
          request.vehicleNumber,
          request.supervisor_notes
        ].map(field => (field || '').toString().toLowerCase());
        
        if (!searchableFields.some(field => field.includes(term))) {
          return false;
        }
      }
      
      return true;
    });
    
    // Sort filtered results by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.created_at || a.requestDate).getTime();
      const dateB = new Date(b.submittedAt || b.created_at || b.requestDate).getTime();
      return dateB - dateA;
    });
    
    console.log('Filtered requests:', filtered.length, 'out of', requests.length);
    setFilteredRequests(filtered);
    
  }, [requests, selectedVehicle, dateRange.startDate, dateRange.endDate, statusFilter, searchTerm]);

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
    navigate(`/supervisor/request/${requestId}`, {
      state: { fromInquiry: true }
    });
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

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending')) return 'bg-yellow-50 text-yellow-800 border-yellow-100';
    if (statusLower.includes('approved')) {
      if (statusLower.includes('supervisor')) return 'bg-green-50 text-green-800 border-green-100';
      if (statusLower.includes('engineer')) return 'bg-blue-50 text-blue-800 border-blue-100';
      return 'bg-green-50 text-green-800 border-green-100';
    }
    if (statusLower.includes('order placed') || statusLower.includes('place order')) return 'bg-purple-50 text-purple-800 border-purple-100';
    if (statusLower.includes('complete')) return 'bg-blue-50 text-blue-800 border-blue-100';
    if (statusLower.includes('rejected')) return 'bg-red-50 text-red-800 border-red-100';
    return 'bg-gray-50 text-gray-800 border-gray-100';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending')) return <Clock className="w-4 h-4 mr-1.5 text-yellow-500" />;
    if (statusLower.includes('approved')) {
      if (statusLower.includes('supervisor')) return <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />;
      if (statusLower.includes('engineer')) return <CheckCircle className="w-4 h-4 mr-1.5 text-blue-500" />;
      return <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />;
    }
    if (statusLower.includes('order placed') || statusLower.includes('place order')) return <Package className="w-4 h-4 mr-1.5 text-purple-500" />;
    if (statusLower.includes('complete')) return <Smile className="w-4 h-4 mr-1.5 text-blue-500" />;
    if (statusLower.includes('rejected')) return <XCircle className="w-4 h-4 mr-1.5 text-red-500" />;
    return <FileText className="w-4 h-4 mr-1.5 text-gray-500" />;
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
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(request.status)} border flex items-center shadow-sm`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Vehicle: {request.vehicleNumber} - Requested by {request.requesterName}
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
