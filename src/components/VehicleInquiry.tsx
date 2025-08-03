import { useState, useEffect, FC } from 'react';
import { TireRequest } from '../types/api';
import { apiUrls } from '../config/api';

// The backend now returns properly formatted TireRequest objects
// so we don't need the conversion functions anymore

const VehicleInquiry: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<TireRequest[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentVehicleSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  // Save to recent searches when a search is performed
  const addToRecentSearches = (vehicleNumber: string) => {
    const updatedSearches = [
      vehicleNumber,
      ...recentSearches.filter(search => search !== vehicleNumber).slice(0, 4) // Keep only the 5 most recent
    ];
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentVehicleSearches', JSON.stringify(updatedSearches));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVehicleSelect = (vehicleNumber: string) => {
    setSearchTerm(vehicleNumber);
    setSelectedVehicle(vehicleNumber);
    handleSearch(vehicleNumber);
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleSearch = async (vehicleNumber?: string) => {
    const searchValue = vehicleNumber?.trim() || searchTerm.trim();
    
    if (!searchValue) {
      setError('Please enter a vehicle number');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching requests for vehicle:', searchValue);
      const response = await fetch(apiUrls.requestsByVehicleNumber(searchValue));
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No requests found for this vehicle number');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error: ${response.status} - ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Received response:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of requests');
      }
      
      // The backend now returns properly formatted data, so we can use it directly
      setSearchResults(data);
      setSelectedVehicle(searchValue);
      addToRecentSearches(searchValue);
      
      if (data.length === 0) {
        setError('No requests found for this vehicle number');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching requests');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Vehicle Inquiry</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="mb-6">
          <label htmlFor="vehicleSearch" className="block text-sm font-medium text-gray-700 mb-2">
            Search by Vehicle Number
          </label>
          <div className="relative">
            <div className="flex">
              <input
                type="text"
                id="vehicleSearch"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter vehicle number"
                className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {isLoading && (
              <div className="absolute inset-y-0 right-16 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((number) => (
                  <button
                    key={number}
                    onClick={() => handleVehicleSelect(number)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700"
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {searchResults.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Tire Requests for {selectedVehicle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {searchResults.length} request{searchResults.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="mt-8">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tire Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {searchResults.map((request: TireRequest) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.tireSizeRequired}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(
                          request.engineerTimestamp || 
                          request.technicalManagerTimestamp || 
                          request.supervisorTimestamp ||
                          request.submittedAt
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : searchTerm ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          {error && (
            <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          {!error && (
            <p className="text-gray-500">No tire requests found for vehicle {searchTerm}</p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default VehicleInquiry;
