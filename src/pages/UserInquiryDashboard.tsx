import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import { 
  ArrowLeft, Loader2, Search, Calendar, Filter, 
  ChevronDown, FileText, CheckCircle2, Clock, XCircle, AlertTriangle 
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
  submittedAt?: string;
  supplierName?: string;
}

const UserInquiryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState(searchParams.get('vehicle') || '');
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [isLoading, setIsLoading] = useState({ vehicles: false, requests: false });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch vehicles and requests logic here...
  // (Previous implementation of fetchVehicles and fetchRequests)

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('pending')) {
      return {
        text: 'Pending',
        icon: <Clock className="w-4 h-4 mr-1.5" />,
        bg: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        border: 'border-yellow-200',
      };
    }
    if (statusLower.includes('approved') || statusLower === 'complete') {
      return {
        text: 'Approved',
        icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />,
        bg: 'bg-green-50',
        textColor: 'text-green-800',
        border: 'border-green-200',
      };
    }
    if (statusLower.includes('rejected')) {
      return {
        text: 'Rejected',
        icon: <XCircle className="w-4 h-4 mr-1.5" />,
        bg: 'bg-red-50',
        textColor: 'text-red-800',
        border: 'border-red-200',
      };
    }
    return {
      text: status || 'Unknown',
      icon: <AlertTriangle className="w-4 h-4 mr-1.5" />,
      bg: 'bg-gray-100',
      textColor: 'text-gray-800',
      border: 'border-gray-200',
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">User Inquiry Dashboard</h1>
          </div>
          
          {/* Vehicle Selection */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-800">Vehicle Information</h2>
                <p className="text-sm text-gray-500">Select a vehicle to view its tire requests</p>
              </div>
              
              <div className="relative">
                <select
                  value={selectedVehicle}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedVehicle(value);
                    navigate(value ? `?vehicle=${value}` : '/user/inquiry-dashboard');
                  }}
                  className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.vehicleNumber}>
                      {vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              Filters
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {isLoading.requests ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading requests...</span>
            </div>
          ) : requests.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => {
                const status = getStatusBadge(request.status);
                return (
                  <li key={request.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <p className="ml-2 text-sm font-medium text-blue-600 truncate">
                            Order #{request.orderNumber || 'N/A'}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bg} ${status.textColor} ${status.border} border`}>
                            {status.icon}
                            {status.text}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="font-medium">Vehicle:</span>
                            <span className="ml-1">{request.vehicleNumber}</span>
                          </p>
                          {request.supplierName && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <span className="font-medium">Supplier:</span>
                              <span className="ml-1">{request.supplierName}</span>
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>
                            {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => navigate(`/user/request-details/${request.id}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View details <span aria-hidden="true">&rarr;</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedVehicle 
                  ? "This vehicle doesn't have any tire requests yet." 
                  : 'Select a vehicle to view its tire requests.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInquiryDashboard;
