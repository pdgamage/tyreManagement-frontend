import React, { useState } from 'react';
import { Search, Car, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TireRequest } from '../types/api';
import RequestTable from '../components/RequestTable';
import RequestDetailsModal from '../components/RequestDetailsModal';

const VehicleSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TireRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle number');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tyremanagement-backend-production.up.railway.app";
      const response = await fetch(`${API_BASE_URL}/api/requests/vehicle/${vehicleNumber.trim()}/requests`);
      
      if (response.ok) {
        const result = await response.json();
        setRequests(result.data || []);
      } else if (response.status === 404) {
        const errorData = await response.json();
        setError(errorData.error || 'No tire requests found for this vehicle number');
        setRequests([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch requests');
        setRequests([]);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const closeDetailsModal = () => {
    setSelectedRequest(null);
  };

  // Convert TireRequest to Request format for RequestTable
  const convertTireRequestToRequest = (tireRequest: any) => {
    return {
      ...tireRequest,
      submittedAt: tireRequest.submittedAt || new Date().toISOString(),
      userSection: tireRequest.userSection || 'Unknown Department'
    };
  };

  // Handler functions for RequestTable
  const handleView = (request: any) => {
    setSelectedRequest(request);
  };

  const handleDelete = async (id: string) => {
    // Handle delete if needed
    console.log('Delete request:', id);
  };

  const handleApprove = (id: string) => {
    console.log('Approve request:', id);
  };

  const handleReject = (id: string) => {
    console.log('Reject request:', id);
  };

  const handlePlaceOrder = (request: any) => {
    console.log('Place order for request:', request);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-2xl border-b border-blue-200">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Vehicle Search
                </h1>
                <p className="text-blue-100 text-lg font-medium mt-1">
                  Search tire requests by vehicle number
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-200 font-medium">Search & Filter</span>
                  <span className="text-blue-300">•</span>
                  <span className="text-sm text-blue-200">Find all requests for a specific vehicle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-6">
        <div className="space-y-8">
          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Search by Vehicle Number</h2>
                  <p className="text-blue-700 text-sm">Enter a vehicle number to find all related tire requests</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="vehicleNumber"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter vehicle number (e.g., ABC123)"
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    <span>{loading ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {error && hasSearched && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">No Results Found</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <p className="text-red-600 text-sm mt-2">
                    Vehicle Number: <span className="font-semibold">{vehicleNumber}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {!error && requests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-green-50 border-b border-green-100 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Results Found</h3>
                    <p className="text-green-700">
                      Found <span className="font-semibold">{requests.length}</span> tire request(s) for vehicle{' '}
                      <span className="font-semibold">{vehicleNumber}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <RequestTable
                  requests={requests.map(convertTireRequestToRequest)}
                  title=""
                  onView={handleView}
                  onDelete={handleDelete}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onPlaceOrder={handlePlaceOrder}
                  showActions={true}
                  showPlaceOrderButton={false}
                  showCancelButton={false}
                />
              </div>
            </div>
          )}

          {!error && requests.length === 0 && hasSearched && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900">No Requests Found</h3>
                  <p className="text-yellow-700 mt-1">
                    No tire requests found for vehicle number <span className="font-semibold">{vehicleNumber}</span>
                  </p>
                  <p className="text-yellow-600 text-sm mt-2">
                    This vehicle may not have any tire requests in the system yet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!hasSearched && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Vehicle Requests</h3>
                <p className="text-gray-600 mb-6">
                  Enter a vehicle number above to find all tire requests associated with that vehicle.
                </p>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 text-left">
                    <li>• Enter the exact vehicle number</li>
                    <li>• View all tire requests for that vehicle</li>
                    <li>• Check request status and details</li>
                    <li>• Track the history of tire requests</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={closeDetailsModal}
          isOpen={!!selectedRequest}
        />
      )}
    </div>
  );
};

export default VehicleSearchPage; 