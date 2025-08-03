import { FC, useState, useEffect } from 'react';
import { Search, Calendar, FileText, Truck, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import { useRequests } from '../contexts/RequestContext';
import { apiUrls } from '../config/api';
import { format } from 'date-fns';

interface RequestDetails {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber?: string;
  supplierName?: string;
  supplierNumber?: string;
  requestDate: string;
  tireSize?: string;
  quantity?: number;
  priority?: string;
  estimatedDelivery?: string;
}

const VehicleInquiry: FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [vehicleList, setVehicleList] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<RequestDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'), // 1st of current month
    endDate: format(new Date(), 'yyyy-MM-dd') // Today
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { requests } = useRequests();

  // Fetch unique vehicle numbers
  useEffect(() => {
    const fetchVehicleNumbers = async () => {
      try {
        const response = await fetch(apiUrls.vehicles);
        if (response.ok) {
          const data = await response.json();
          const numbers = data.map((vehicle: any) => vehicle.vehicleNumber).filter(Boolean);
          setVehicleList(Array.from(new Set(numbers)));
        }
      } catch (error) {
        console.error('Error fetching vehicle numbers:', error);
      }
    };

    fetchVehicleNumbers();
  }, []);

  // Search for requests by vehicle number
  const handleSearch = async () => {
    if (!selectedVehicle) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiUrls.requests}?vehicleNumber=${encodeURIComponent(selectedVehicle)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests by date range
  const filteredRequests = searchResults.filter(request => {
    const requestDate = new Date(request.requestDate);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day
    
    return requestDate >= start && requestDate <= end;
  });

  // Get status badge style
  const getStatusBadge = (status: string) => {
    const baseStyle = 'px-2 py-1 text-xs font-medium rounded-full';
    
    switch (status.toLowerCase()) {
      case 'approved':
      case 'complete':
        return `${baseStyle} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseStyle} bg-yellow-100 text-yellow-800`;
      case 'rejected':
      case 'cancelled':
        return `${baseStyle} bg-red-100 text-red-800`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'complete':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'pending':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Inquiry</h1>
        <p className="text-gray-600">Search and track tire requests by vehicle number</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <div className="relative">
              <select
                id="vehicleNumber"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a vehicle</option>
                {vehicleList.map((vehicle) => (
                  <option key={vehicle} value={vehicle}>
                    {vehicle}
                  </option>
                ))}
              </select>
              <Truck className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={!selectedVehicle || isLoading}
              className={`flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-medium ${
                !selectedVehicle || isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Filter className="w-4 h-4 mr-1" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Date Range</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1">
                    From Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="startDate"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                      className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1">
                    To Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="endDate"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Request Details for {selectedVehicle}
            </h2>
            <p className="text-sm text-gray-500">
              Showing {filteredRequests.length} request(s) between {format(new Date(dateRange.startDate), 'MMM d, yyyy')} and {format(new Date(dateRange.endDate), 'MMM d, yyyy')}
            </p>
          </div>

          {filteredRequests.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">Order #{request.orderNumber || 'N/A'}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(request.requestDate), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(request.status)}
                        <span className={getStatusBadge(request.status)}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    <button className="mt-2 md:mt-0 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      View Details
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</p>
                      <p className="mt-1 text-sm text-gray-900">{request.supplierName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</p>
                      <p className="mt-1 text-sm text-gray-900">{request.supplierNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tire Size</p>
                      <p className="mt-1 text-sm text-gray-900">{request.tireSize || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</p>
                      <p className="mt-1 text-sm text-gray-900">{request.quantity || 'N/A'}</p>
                    </div>
                  </div>

                  {request.estimatedDelivery && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Delivery</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(request.estimatedDelivery), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No requests found for the selected date range.
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a vehicle and click search to view request history.
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleInquiry;
