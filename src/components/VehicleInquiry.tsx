import { FC, useState, useEffect, useMemo } from 'react';
import { useRequests } from '../contexts/RequestContext';
import { TireRequest } from '../types/api';

const VehicleInquiry: FC = () => {
  const { requests: allRequests } = useRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Convert Request[] to TireRequest[] with proper type safety
  const tireRequests = useMemo(() => {
    return (allRequests as unknown as TireRequest[]).filter(
      (req): req is TireRequest => Boolean(req.vehicleNumber)
    );
  }, [allRequests]);
  
  // Track search results
  const [searchResults, setSearchResults] = useState<TireRequest[]>([]);

  // Filter requests by vehicle number when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Find matching vehicle requests
    const searchLower = searchTerm.toLowerCase();
    const matchingRequests = tireRequests.filter(request => 
      request.vehicleNumber?.toLowerCase().includes(searchLower)
    );
    
    setSearchResults(matchingRequests);
    setIsSearching(false);
  }, [searchTerm, tireRequests]);

  // Get unique vehicle numbers from requests
  const uniqueVehicleNumbers = useMemo(() => {
    return Array.from(
      new Set(tireRequests.map(req => req.vehicleNumber).filter(Boolean))
    ).sort() as string[];
  }, [tireRequests]);

  const handleVehicleSelect = (vehicleNumber: string) => {
    setSearchTerm(vehicleNumber);
    setSelectedVehicle(vehicleNumber);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
            <input
              type="text"
              id="vehicleSearch"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter vehicle number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          
          {/* Quick vehicle number suggestions */}
          {uniqueVehicleNumbers.length > 0 && searchTerm && (
            <div className="mt-2 space-y-1">
              {uniqueVehicleNumbers
                .filter(num => 
                  num.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  num !== searchTerm
                )
                .slice(0, 5)
                .map((number) => (
                  <div 
                    key={number}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                    onClick={() => handleVehicleSelect(number)}
                  >
                    {number}
                  </div>
                ))}
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
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tire Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.tireSizeRequired || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.engineerTimestamp || request.technicalManagerTimestamp || request.supervisorTimestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : searchTerm ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No tire requests found for vehicle {searchTerm}</p>
        </div>
      ) : null}
    </div>
  );
};

export default VehicleInquiry;
