import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import { 
  ArrowLeft, 
  Car,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";

// Component to display a loading state
const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

// Component to display error messages
const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
    <p className="text-red-700">{error}</p>
  </div>
);

// Constants
const STATUS_MESSAGES = {
  LOADING: "Loading...",
  NO_VEHICLE: "Please select a vehicle",
  NO_REQUESTS: "No requests found for this vehicle",
  ERROR: "An error occurred while fetching data"
};

interface Vehicle {
  id: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  registrationNumber?: string;
}

interface TireRequest {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  requestDate: string;
  supplierDetails: {
    name: string;
    phone: string;
    email: string;
  };
  tireDetails: {
    size: string;
    quantity: number;
    tubesQuantity: number;
    reason: string;
    make: string;
  };
  vehicleDetails: {
    brand: string;
    model: string;
    lastReplacement: string;
    kmReading: {
      current: number;
      previous: number;
    };
  };
  requesterDetails: {
    name: string;
    department: string;
    costCenter: string;
  };
  approvalNotes: {
    supervisor?: string;
    technicalManager?: string;
    engineer?: string;
    customerOfficer?: string;
  };
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

interface RequestDetail extends TireRequest {
  created_at?: string;
  submittedAt?: string;
}

const TireInquiryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle') || '';

  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicleFromUrl);
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [isLoading, setIsLoading] = useState({
    vehicles: false,
    requests: false
  });
  const [error, setError] = useState<{
    vehicles?: string;
    requests?: string;
  }>({});
  
  // Handle view details click
  const handleViewDetails = useCallback((requestId: string) => {
    window.location.href = `/request/${requestId}`;
  }, []);

  // Fetch vehicles function
  const fetchVehicles = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, vehicles: true }));
    setError(prev => ({ ...prev, vehicles: undefined }));

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/vehicles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(response.status === 404 ? 'No vehicles found' : 'Failed to fetch vehicles');
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setVehicles(data.map(vehicle => ({
        id: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        brand: vehicle.brand || 'Unknown',
        model: vehicle.model || 'Unknown',
        registrationNumber: vehicle.registrationNumber
      })));
    } catch (err) {
      setError(prev => ({
        ...prev,
        vehicles: err instanceof Error ? err.message : 'Failed to load vehicles'
      }));
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, vehicles: false }));
    }
  }, []);

  // Fetch requests function
  const fetchRequests = useCallback(async (vehicleNumber: string) => {
    if (!vehicleNumber) return;

    setIsLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: undefined }));
    setRequests([]);

    try {
      console.log('Fetching requests for vehicle:', vehicleNumber);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/requests/by-vehicle/${encodeURIComponent(vehicleNumber)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 404) {
        setRequests([]);
        throw new Error('No requests found for this vehicle');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setRequests(data.map(request => ({
        id: request.id,
        vehicleNumber: request.vehicleNumber,
        status: request.status || 'Pending',
        orderNumber: request.orderNumber || 'Not Assigned',
        requestDate: request.created_at || request.submittedAt,
        supplierDetails: {
    } catch (err) {
      setError(prev => ({ ...prev, requests: 'Failed to load requests' }));
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, []);

  // Render function for the dashboard header
  const renderHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">Tire Inquiry Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Selection */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-white mb-2">
            Select Vehicle
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.vehicleNumber}>
                  {vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
            {selectedVehicle && (
              <button
                onClick={() => {
                  setSelectedVehicle('');
                  navigate('/user/inquiry-dashboard');
                }}
                className="p-2 text-white hover:text-red-200 transition-colors"
                title="Clear filter"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading.vehicles ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error.vehicles ? (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error.vehicles}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {!selectedVehicle ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Please select a vehicle to view requests</p>
              </div>
            ) : isLoading.requests ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error.requests ? (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error.requests}</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No requests found for the selected vehicle</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Requests for {selectedVehicle}
                  </h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {requests.map((request) => (
                      <li key={request.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              Request #{request.id}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                                {request.status}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {request.vehicleNumber}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                {new Date(request.requestDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <button
                              onClick={() => handleViewDetails(request.id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      </li>
                </div>
                <p className="text-gray-500 text-lg mb-2">No requests found</p>
                <p className="text-gray-400 text-sm">No tire requests have been made for vehicle {selectedVehicle}</p>
              </div>
            )}
          </div>

        {/* Report Section */}
              )}
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
              <h2 className="text-xl font-bold text-green-900">Request Report by Date Range</h2>
              <p className="text-green-700 text-sm">Filter and view all tire requests within a specific date range</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <button
              onClick={handleReportSearch}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:shadow-lg transition-all flex items-center space-x-2"
              disabled={!dateFrom || !dateTo || loading}
            >
              <Filter className="w-4 h-4" />
              <span>{loading ? "Filtering..." : "Generate Report"}</span>
            </button>
          </div>

          {reportResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Report Results ({reportResults.length} requests found)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Request ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Vehicle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Requested Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Tire Size</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Requester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportResults.map(request => (
                      <tr key={request.id} className="border-t border-gray-100 hover:bg-green-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">#{request.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.vehicleNumber}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.orderNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.supplierDetails.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(request.requestDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.tireDetails.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.tireDetails.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.requesterDetails.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dateFrom && dateTo && reportResults.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2">No requests found</p>
              <p className="text-gray-400 text-sm">No tire requests were made between {dateFrom} and {dateTo}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TireInquiryDashboard;