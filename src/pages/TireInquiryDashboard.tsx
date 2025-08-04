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
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('approved') || statusLower === 'complete') return 'bg-green-100 text-green-800';
    if (statusLower.includes('rejected')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // --- Redesigned Dashboard Layout ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-blue-800 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Tire Inquiry Dashboard</h1>
        </div>
      </div>

      {/* Vehicle Selection Card */}
      <div className="max-w-3xl mx-auto -mt-10 z-10 relative">
        <div className="bg-white shadow-xl rounded-xl p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
            <span className="mr-2">Select Vehicle</span>
            {isLoading.vehicles && (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            )}
          </h2>
          {error.vehicles && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error.vehicles}
            </div>
          )}
          <div className="flex space-x-2">
            <select
              value={selectedVehicle}
              onChange={handleVehicleChange}
              className="flex-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
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
                className="p-2 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-lg border border-gray-200 transition"
                title="Clear selection"
                aria-label="Clear vehicle selection"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Card */}
      {selectedVehicle && (
        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-blue-100">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Filter Requests</h2>
            {/* You can add date and status filters here if needed */}
            {/* ... */}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 mt-8">
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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Tire Requests for {selectedVehicle}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          Request #{request.id}
                        </p>
                        <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
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
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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
