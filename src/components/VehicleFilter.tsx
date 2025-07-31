import React, { useState } from 'react';
import { Search, Car, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { TireRequest } from '../types/api';
import RequestTable from './RequestTable';
import RequestDetailsModal from './RequestDetailsModal';

interface VehicleFilterProps {
  onClose: () => void;
}

const VehicleFilter: React.FC<VehicleFilterProps> = ({ onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Vehicle Filter</h2>
                <p className="text-blue-100 text-sm">Search tire requests by vehicle number</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <XCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-8 border-b border-gray-100">
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

        {/* Results Section */}
        <div className="flex-1 overflow-y-auto p-8">
          {error && hasSearched && (
            <div className="max-w-2xl mx-auto">
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
            </div>
          )}

          {!error && requests.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
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

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Tire Requests</h3>
                  <p className="text-gray-600 text-sm">Showing all requests for this vehicle</p>
                </div>
                <div className="p-6">
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
            </div>
          )}

          {!error && requests.length === 0 && hasSearched && (
            <div className="max-w-2xl mx-auto">
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
            </div>
          )}

          {!hasSearched && (
            <div className="max-w-2xl mx-auto text-center py-12">
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
          )}
        </div>
      </div>

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

export default VehicleFilter; 