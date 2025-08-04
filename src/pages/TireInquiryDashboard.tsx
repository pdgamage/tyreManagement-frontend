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

    <div className="min-h-screen bg-gray-50">
      {/* Banner/Header */}
      <div className="w-full bg-gradient-to-r from-blue-700 to-blue-500 shadow-lg relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-8 gap-4 w-full">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Go back"
            >
              <ArrowLeft className="w-7 h-7 text-white" />
            </button>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow">Tire Inquiry Dashboard</h1>
          </div>
          {/* Search Option in Banner */}
          <div className="w-full md:w-1/3 flex justify-end mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full md:w-72 px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/30 transition"
              style={{ backdropFilter: 'blur(4px)' }}
            />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto -mt-12 z-10 relative">
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-blue-100 flex flex-col gap-6">
          {/* Vehicle Selection */}
          <div>
            <label className="block text-base font-semibold text-blue-900 mb-2">Select Vehicle</label>
            <div className="flex space-x-2 items-center">
              <select
                value={selectedVehicle}
                onChange={handleVehicleChange}
                className="flex-1 p-3 rounded-lg border border-blue-300 text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm bg-blue-50 hover:bg-blue-100"
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
            {isLoading.vehicles && (
              <div className="flex items-center mt-2 text-blue-600 text-sm"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading vehicles...</div>
            )}
            {error.vehicles && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error.vehicles}
              </div>
            )}
          </div>
          {/* Filter Section Placeholder */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h2 className="text-base font-semibold text-blue-900 mb-2">Filter Requests</h2>
            {/* Add filter controls here if needed */}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 sm:px-6 lg:px-8 mt-12">
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
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-xl px-6 py-4 border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Tire Requests for {selectedVehicle}</h3>
                <p className="mt-1 text-sm text-gray-500">Showing {requests.length} request{requests.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <ul className="space-y-4">
              {requests.map((request) => (
                <li key={request.id} className="bg-white rounded-lg shadow border border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium text-blue-700 truncate">Request #{request.id}</p>
                      <span className={`inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadgeColor(request.status)}`}>
                        {/* Status icon */}
                        {request.status.toLowerCase().includes('approved') && (
                          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                        {request.status.toLowerCase().includes('pending') && (
                          <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
                        )}
                        {request.status.toLowerCase().includes('rejected') && (
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                        {request.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </div>
                      {request.orderNumber && (
                        <div className="flex items-center gap-1 mt-2 sm:mt-0">
                          <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          <span>Order #{request.orderNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      onClick={() => handleViewDetails(request.id)}
                      aria-label={`View details for request ${request.orderNumber || request.id}`}
                    >
                      View Details
                    </button>
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
