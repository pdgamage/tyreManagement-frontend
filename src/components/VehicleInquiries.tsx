import React from 'react';
import { AlertCircle, Search, Loader2, XCircle, FileDown } from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';

interface VehicleInquiriesProps {
  isLoading: {
    vehicles: boolean;
    requests: boolean;
  };
  error: {
    vehicles: string | null;
    requests: string | null;
  };
  selectedVehicle: string;
  filteredRequests: any[];
  requests: any[];
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onRequestDetails: (requestId: string) => void;
  onRetryFetch: () => void;
  getStatusBadgeColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const VehicleInquiries: React.FC<VehicleInquiriesProps> = ({
  isLoading,
  error,
  selectedVehicle,
  filteredRequests,
  requests,
  searchTerm,
  statusFilter,
  onSearchChange,
  onClearFilters,
  onRequestDetails,
  onRetryFetch,
  getStatusBadgeColor,
  getStatusIcon,
}) => {
  // Extra status note for clarity in list/table views
  const getStatusExtraText = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') {
      return ' - user tire requested';
    }
    return '';
  };
  const handleExport = () => {
    let filename = 'tire_requests';
    if (selectedVehicle) {
      filename += '_' + selectedVehicle.replace(/\s+/g, '_');
    }
    if (statusFilter !== 'all') {
      filename += '_' + statusFilter.replace(/\s+/g, '_');
    }
    if (searchTerm) {
      filename += '_filtered';
    }
    exportToExcel(filteredRequests, filename);
  };

  return (
    <div>
      {/* Error State */}
      {error.requests && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading requests</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.requests}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onRetryFetch}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading.requests && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg text-gray-600">Loading requests...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading.requests && !error.requests && requests.length === 0 && selectedVehicle && (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 max-w-lg mx-auto">
            <XCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedVehicle === 'All Vehicles'
                ? "There are no tire requests in the system yet."
                : `No tire requests found for vehicle ${selectedVehicle}.`}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading.requests && !error.requests && requests.length > 0 && (
        <>
          {/* Search and Filter Bar */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            <div className="p-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex-1 min-w-[200px] relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search by order number or supplier..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onClearFilters}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear filters
                  </button>

                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export to Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Order #{request.orderNumber || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Requested: {new Date(request.requestDate).toLocaleDateString()}
                            </div>
                            {request.tireCount && (
                              <div className="text-sm text-gray-500">
                                Tires requested: {request.tireCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                          {getStatusExtraText(request.status) && (
                            <span className="ml-1 text-[11px] opacity-80">
                              {getStatusExtraText(request.status)}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.supplierName || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onRequestDetails(request.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleInquiries;
