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
    if (!vehicleNumber) return;
    setIsLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: '' }));
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}/by-vehicle/${vehicleNumber}`;
      console.log('Fetching requests from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      console.log('Requests data received:', data);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError(prev => ({ 
        ...prev, 
        requests: `Failed to load requests: ${err?.message || 'Unknown error'}` 
      }));
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

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedVehicle(value);
    navigate(value ? `?vehicle=${value}` : '/user/inquiry-dashboard');
    if (value) fetchRequests(value);
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('approved') || statusLower === 'complete') return 'bg-green-100 text-green-800';
    if (statusLower.includes('rejected')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-blue-700 rounded-full"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Tire Inquiry Dashboard</h1>
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
                className="flex-1 p-2 rounded-lg text-gray-900"
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
        {isLoading.requests ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error.requests ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
            <p className="text-red-700">{error.requests}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {selectedVehicle 
                ? 'No requests found for this vehicle' 
                : 'Please select a vehicle to view requests'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {requests.map(request => (
                <li key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Request #{request.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.requestDate || request.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                      {request.status}
                    </span>
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
