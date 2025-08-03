import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrls } from '../config/api';
import { format } from 'date-fns';
import { Search, Calendar as CalendarIcon, X, Filter, Download } from 'lucide-react';

interface Request {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber?: string;
  supplierName?: string;
  supplierNumber?: string;
  submittedAt: string;
  // Add other fields as needed
}

const UserInquiry = () => {
  const [vehicleNumbers, setVehicleNumbers] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [searchResults, setSearchResults] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const navigate = useNavigate();

  // Fetch all unique vehicle numbers
  useEffect(() => {
    const fetchVehicleNumbers = async () => {
      try {
        const response = await fetch(apiUrls.requests());
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        
        // Extract unique vehicle numbers
        const uniqueVehicles = [...new Set(data.map((req: Request) => req.vehicleNumber))] as string[];
        setVehicleNumbers(uniqueVehicles);
      } catch (err) {
        console.error('Error fetching vehicle numbers:', err);
        setError('Failed to load vehicle numbers');
      }
    };

    fetchVehicleNumbers();
  }, []);

  const handleSearch = async () => {
    if (!selectedVehicle) {
      setError('Please select a vehicle number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrls.requests());
      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      const filtered = data.filter((req: Request) => 
        req.vehicleNumber === selectedVehicle
      );
      
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error searching requests:', err);
      setError('Failed to search requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeSearch = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrls.requests());
      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      const filtered = data.filter((req: Request) => {
        const requestDate = new Date(req.submittedAt);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end day
        
        return requestDate >= start && requestDate <= end;
      });
      
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSelectedVehicle('');
    setSearchResults([]);
    setError('');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'supervisor approved': 'bg-green-100 text-green-800',
      'technical-manager approved': 'bg-green-100 text-green-800',
      'engineer approved': 'bg-green-100 text-green-800',
      'supervisor rejected': 'bg-red-100 text-red-800',
      'technical-manager rejected': 'bg-red-100 text-red-800',
      'engineer rejected': 'bg-red-100 text-red-800',
      'order placed': 'bg-blue-100 text-blue-800',
      'complete': 'bg-purple-100 text-purple-800',
      'order cancelled': 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const exportToCSV = () => {
    if (searchResults.length === 0) return;

    const headers = [
      'Order Number',
      'Vehicle Number',
      'Status',
      'Supplier Name',
      'Supplier Number',
      'Submitted Date',
    ];

    const csvContent = [
      headers.join(','),
      ...searchResults.map(item => [
        `"${item.orderNumber || 'N/A'}"`,
        `"${item.vehicleNumber}"`,
        `"${item.status}"`,
        `"${item.supplierName || 'N/A'}"`,
        `"${item.supplierNumber || 'N/A'}"`,
        `"${format(new Date(item.submittedAt), 'yyyy-MM-dd HH:mm')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tire-requests-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {showReport ? 'Tire Request Report' : 'Tire Request Inquiry'}
          </h2>
          <button
            onClick={() => setShowReport(!showReport)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showReport ? 'Switch to Vehicle Search' : 'Switch to Date Range Report'}
          </button>
        </div>

        {!showReport ? (
          // Vehicle Search Form
          <div className="space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                  Select Vehicle Number
                </label>
                <div className="flex mt-1 rounded-md shadow-sm">
                  <select
                    id="vehicleNumber"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicleNumbers.map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={isLoading || !selectedVehicle}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Date Range Report Form
          <div className="space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Date Range</label>
                <div className="flex mt-1 space-x-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                      className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Start date"
                    />
                  </div>
                  <span className="flex items-center text-gray-500">to</span>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                      className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="End date"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDateRangeSearch}
                    disabled={isLoading || !dateRange.startDate || !dateRange.endDate}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {showReport 
                  ? `Report: ${format(new Date(dateRange.startDate), 'MMM d, yyyy')} to ${format(new Date(dateRange.endDate), 'MMM d, yyyy')}`
                  : `Results for Vehicle: ${selectedVehicle}`}
              </h3>
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Export to CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Order Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Vehicle Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Supplier
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Submitted Date
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {request.orderNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {request.vehicleNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <div>{request.supplierName || 'N/A'}</div>
                        {request.supplierNumber && (
                          <div className="text-sm text-gray-500">{request.supplierNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {format(new Date(request.submittedAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/user/request/${request.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {searchResults.length === 0 && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-gray-300 border-dashed rounded-lg">
            <Search className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {showReport 
                ? 'Try adjusting your date range or check back later.'
                : 'Select a vehicle number and click search to find requests.'}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
            <span className="ml-3 text-gray-700">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInquiry;
