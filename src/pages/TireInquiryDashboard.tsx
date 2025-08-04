import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import { ArrowLeft, AlertCircle, Loader2, X } from "lucide-react";

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
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending')) return 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20';
    if (statusLower.includes('approved') || statusLower === 'complete') return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20';
    if (statusLower.includes('rejected')) return 'bg-rose-100 text-rose-700 ring-1 ring-rose-600/20';
    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/20';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-blue-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-800"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Tire Inquiry Dashboard</h1>
          </div>
        
        <div className="max-w-3xl">
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">
                Select Vehicle
              </label>
              {isLoading.vehicles && (
                <div className="flex items-center text-sm text-gray-300">
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Loading vehicles...
                </div>
              )}
            </div>
            
            {error.vehicles && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error.vehicles}
              </div>
            )}
            
            <div className="flex space-x-2">
              <select
                value={selectedVehicle}
                onChange={handleVehicleChange}
                className="flex-1 p-3 rounded-xl text-gray-900 bg-white border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={isLoading.vehicles}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.vehicleNumber}>
                    {v.vehicleNumber} - {v.brand} {v.model}
                  </option>
                ))}
              </select>
              
              {selectedVehicle && (
                <button
                  onClick={() => {
                    setSelectedVehicle('');
                    navigate('/user/inquiry-dashboard');
                  }}
                  className="p-2 hover:text-red-200"
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

      <main className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {isLoading.requests && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading requests for {selectedVehicle}...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading.requests && error.requests && (
          <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading requests</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.requests}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading.requests && !error.requests && requests.length === 0 && selectedVehicle && (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
            <p className="text-gray-500">No tire requests were found for vehicle {selectedVehicle}.</p>
          </div>
        )}

        {/* Initial State - No vehicle selected */}
        {!isLoading.requests && !selectedVehicle && (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No vehicle selected</h3>
            <p className="text-gray-500">Please select a vehicle to view its tire requests.</p>
          </div>
        )}

        {/* Requests List */}
        {!isLoading.requests && !error.requests && requests.length > 0 && (
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 sm:px-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-xl leading-6 font-semibold text-gray-900">
                Tire Requests for {selectedVehicle}
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request.id} className="group px-6 py-5 sm:px-8 hover:bg-blue-50/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-base font-medium text-blue-700 truncate group-hover:text-blue-800">
                          Request #{request.id}
                        </p>
                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                        {request.orderNumber && (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Order #{request.orderNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                        onClick={() => handleViewDetails(request.id)}
                        aria-label={`View details for request ${request.orderNumber || request.id}`}
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
      </main>
    </div>
  );
};

export default TireInquiryDashboard;
