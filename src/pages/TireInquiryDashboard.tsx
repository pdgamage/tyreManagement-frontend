import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import { 
  ArrowLeft, 
  ArrowRight,
  AlertCircle, 
  Loader2, 
  X, 
  Truck, 
  Calendar, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  List,
  RefreshCw
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
}

const TireInquiryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle') || '';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleFromUrl);
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [isLoading, setIsLoading] = useState({ vehicles: false, requests: false });
  const [error, setError] = useState({ vehicles: '', requests: '' });
  
  const fetchVehicles = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, vehicles: true }));
    setError(prev => ({ ...prev, vehicles: '' }));
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VEHICLES}`;
      console.log('Fetching vehicles from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch vehicles: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      console.log('Vehicles data received:', data);
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
      console.log('No vehicle number provided, skipping request fetch');
      setRequests([]);
      return;
    }
    
    console.log('Fetching requests for vehicle:', vehicleNumber);
    setIsLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: '' }));
    
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}/vehicle/${encodeURIComponent(vehicleNumber)}`;
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          // Add any required authentication headers here
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Request failed with status:', response.status, 'Response:', errorText);
        throw new Error(`Failed to fetch requests: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Received response:', result);
      
      // Handle the response format from the backend
      const requestsData = Array.isArray(result.data) ? result.data : [];
      console.log(`Found ${requestsData.length} requests for vehicle ${vehicleNumber}`, requestsData);
      
      // Map the data to match the TireRequest interface
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
      
      if (formattedRequests.length === 0) {
        console.log('No requests found for the selected vehicle');
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
    } finally {
      console.log('Finished loading requests');
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
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tire Inquiry</h1>
                <p className="text-sm text-gray-500">View and manage tire requests</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Vehicle Selection Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Vehicle Selection</h2>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div>
                <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Vehicle
                </label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Truck className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="vehicle-select"
                      value={selectedVehicle}
                      onChange={handleVehicleChange}
                      className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      disabled={isLoading.vehicles}
                    >
                      <option value="">Select a vehicle</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.vehicleNumber}>
                          {v.vehicleNumber} - {v.brand} {v.model}
                        </option>
                      ))}
                    </select>
                    {isLoading.vehicles && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  {selectedVehicle && (
                    <button
                      onClick={() => {
                        setSelectedVehicle('');
                        navigate('/user/inquiry-dashboard');
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Clear selection"
                      aria-label="Clear vehicle selection"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
              
              {error.vehicles && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error loading vehicles</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error.vehicles}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading.requests && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Loading Requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Fetching tire requests for {selectedVehicle}...
              </p>
              <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading.requests && error.requests && (
          <div className="rounded-xl bg-red-50 border border-red-100 overflow-hidden">
            <div className="p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-red-800">
                    Unable to load requests
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error.requests}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => selectedVehicle && fetchRequests(selectedVehicle)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <RefreshCw className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - No requests */}
        {!isLoading.requests && !error.requests && requests.length === 0 && selectedVehicle && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gray-50">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tire requests were found for vehicle <span className="font-medium">{selectedVehicle}</span>.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => fetchRequests(selectedVehicle)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Initial State - No vehicle selected */}
        {!isLoading.requests && !selectedVehicle && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50">
                <Truck className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No vehicle selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please select a vehicle from the dropdown above to view its tire requests.
              </p>
              <div className="mt-6">
                <div className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <List className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
                  View All Vehicles
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        {!isLoading.requests && !error.requests && requests.length > 0 && (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Tire Requests
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Showing {requests.length} request{requests.length !== 1 ? 's' : ''} for {selectedVehicle}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="all"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div 
                  key={request.id} 
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h4 className="text-base font-medium text-gray-900 truncate">
                          Request #{request.id}
                        </h4>
                        <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start">
                          <Calendar className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="ml-2">
                            <p className="text-xs text-gray-500">Request Date</p>
                            <p className="text-gray-900">
                              {new Date(request.requestDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {request.orderNumber && (
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                              <span className="text-xs text-gray-500">#</span>
                            </div>
                            <div className="ml-2">
                              <p className="text-xs text-gray-500">Order Number</p>
                              <p className="text-gray-900">{request.orderNumber}</p>
                            </div>
                          </div>
                        )}
                        
                        {request.supplierName && (
                          <div className="flex items-start">
                            <Truck className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="ml-2">
                              <p className="text-xs text-gray-500">Supplier</p>
                              <p className="text-gray-900">{request.supplierName}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(request.id)}
                        className="inline-flex items-center px-3.5 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        aria-label={`View details for request ${request.orderNumber || request.id}`}
                      >
                        <span>View Details</span>
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                    <span className="font-medium">{requests.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      aria-current="page"
                      className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      1
                    </button>
                    <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                      2
                    </button>
                    <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                      3
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TireInquiryDashboard;
