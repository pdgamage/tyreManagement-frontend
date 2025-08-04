import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import { ArrowLeft, AlertCircle, Loader2, X, Search, Car, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";

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
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "complete", label: "Complete" },
];

const TireInquiryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle') || '';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleFromUrl);
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TireRequest[]>([]);
  const [isLoading, setIsLoading] = useState({ vehicles: false, requests: false });
  const [error, setError] = useState({ vehicles: '', requests: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
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
      setError(prev => ({ 
        ...prev, 
        vehicles: `Failed to load vehicles: ${err?.message || 'Unknown error'}` 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, vehicles: false }));
    }
  }, []);

  const fetchRequests = useCallback(async (vehicleNumber: string) => {
    if (!vehicleNumber) {
      setRequests([]);
      return;
    }
    
    setIsLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: '' }));
    
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}/vehicle/${encodeURIComponent(vehicleNumber)}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      const requestsData = Array.isArray(result.data) ? result.data : [];
      
      const formattedRequests = requestsData.map((req: any) => ({
        id: req.id?.toString() || '',
        vehicleNumber: req.vehicleNumber || '',
        status: req.status || 'unknown',
        orderNumber: req.orderNumber || '',
        requestDate: req.requestDate || req.submittedAt || new Date().toISOString(),
        submittedAt: req.submittedAt,
        supplierName: req.supplierName || 'N/A',
      }));
      
      setRequests(formattedRequests);
      setFilteredRequests(formattedRequests);
      
      if (formattedRequests.length === 0) {
        setError(prev => ({ ...prev, requests: 'No requests found for this vehicle' }));
      } else {
        setError(prev => ({ ...prev, requests: '' }));
      }
      
    } catch (err: any) {
      console.error('Error in fetchRequests:', err);
      setError(prev => ({ 
        ...prev, 
        requests: `Failed to load requests: ${err?.message || 'Unknown error'}` 
      }));
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (vehicleFromUrl) {
      setSelectedVehicle(vehicleFromUrl);
      fetchRequests(vehicleFromUrl);
    }
  }, [vehicleFromUrl, fetchRequests]);

  useEffect(() => {
    let results = requests;
    
    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(request => 
        request.status.toLowerCase().includes(statusFilter)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(request => 
        request.orderNumber.toLowerCase().includes(term) || 
        request.id.toLowerCase().includes(term) ||
        request.supplierName?.toLowerCase().includes(term)
      );
    }
    
    setFilteredRequests(results);
  }, [searchTerm, statusFilter, requests]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedVehicle(value);
    navigate(value ? `?vehicle=${value}` : '/user/inquiry-dashboard');
    if (value) fetchRequests(value);
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/user/request-details/${requestId}`, {
      state: { fromInquiry: true }
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('approved') || statusLower === 'complete') return 'bg-green-100 text-green-800';
    if (statusLower.includes('rejected')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-blue-700 transition-colors duration-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Tire Request Dashboard</h1>
                <p className="text-blue-100">Track and manage your tire requests</p>
              </div>
            </div>
          </div>
          
          {/* Vehicle Selection Card */}
          <div className="mt-6 bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-4 shadow">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-blue-100">
                  Select Vehicle
                </label>
                {isLoading.vehicles && (
                  <div className="flex items-center text-sm text-blue-200">
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Loading vehicles...
                  </div>
                )}
              </div>
              
              {error.vehicles && (
                <div className="mb-3 p-3 bg-red-500 bg-opacity-20 rounded-lg text-red-100 text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error.vehicles}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Car className="h-5 w-5 text-blue-300" />
                  </div>
                  <select
                    value={selectedVehicle}
                    onChange={handleVehicleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-blue-300 rounded-lg bg-white bg-opacity-90 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading.vehicles}
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.vehicleNumber}>
                        {v.vehicleNumber} - {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedVehicle && (
                  <button
                    onClick={() => {
                      setSelectedVehicle('');
                      navigate('/user/inquiry-dashboard');
                    }}
                    className="p-3 text-blue-200 hover:text-white transition-colors duration-200"
                    title="Clear selection"
                    aria-label="Clear vehicle selection"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section (only shown when vehicle is selected) */}
        {selectedVehicle && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center justify-between w-full md:w-48 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  {statusOptions.find(opt => opt.value === statusFilter)?.label || "Filter by status"}
                  {isStatusDropdownOpen ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </button>
                
                {isStatusDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            statusFilter === option.value
                              ? "bg-blue-100 text-blue-800"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setStatusFilter(option.value);
                            setIsStatusDropdownOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Loading State */}
          {isLoading.requests && (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-white rounded-lg shadow">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading requests for {selectedVehicle}...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading.requests && error.requests && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-red-50">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-red-800">Error loading requests</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{error.requests}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading.requests && !error.requests && filteredRequests.length === 0 && selectedVehicle && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No matching requests found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : `No tire requests were found for vehicle ${selectedVehicle}.`}
                </p>
              </div>
            </div>
          )}

          {/* Initial State - No vehicle selected */}
          {!isLoading.requests && !selectedVehicle && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                  <Car className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No vehicle selected</h3>
                <p className="text-gray-500">Please select a vehicle from the dropdown above to view its tire requests.</p>
              </div>
            </div>
          )}

          {/* Requests List */}
          {!isLoading.requests && !error.requests && filteredRequests.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    <span className="hidden sm:inline">Tire Requests for </span>
                    <span className="font-semibold text-blue-600">{selectedVehicle}</span>
                  </h3>
                  <p className="mt-1 sm:mt-0 text-sm text-gray-500">
                    Showing {filteredRequests.length} of {requests.length} request{requests.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <li key={request.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-base font-semibold text-gray-900 truncate">
                            Request #{request.id}
                          </p>
                          <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {formatDate(request.requestDate)}
                          </div>
                          {request.orderNumber && (
                            <div className="flex items-center">
                              <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              Order #{request.orderNumber}
                            </div>
                          )}
                          {request.supplierName && (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {request.supplierName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          onClick={() => handleViewDetails(request.id)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TireInquiryDashboard;