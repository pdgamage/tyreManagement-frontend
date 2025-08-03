import { useState, useMemo, FC } from 'react';
import { useRequests } from '../contexts/RequestContext';
import { TireRequest } from '../types/api';

// Type guard to check if an object has the required properties
const isTireRequestLike = (obj: any): obj is Partial<TireRequest> => {
  return (
    obj &&
    (typeof obj.id === 'number' || typeof obj.id === 'string') &&
    typeof obj.vehicleNumber === 'string'
  );
};

// Helper to safely convert any object to TireRequest
const safeToTireRequest = (obj: any): TireRequest | null => {
  if (!isTireRequestLike(obj)) return null;
  
  try {
    // Create base request with all required fields and default values
    const baseRequest: Omit<TireRequest, 'id' | 'vehicleId'> = {
      vehicleNumber: String(obj.vehicleNumber || 'Unknown'),
      quantity: Number(obj.quantity || 0),
      tubesQuantity: Number(obj.tubesQuantity || 0),
      requestReason: String(obj.requestReason || ''),
      requesterName: String(obj.requesterName || ''),
      requesterEmail: String(obj.requesterEmail || ''),
      requesterPhone: String(obj.requesterPhone || ''),
      vehicleBrand: String(obj.vehicleBrand || ''),
      vehicleModel: String(obj.vehicleModel || ''),
      vehicleType: String(obj.vehicleType || ''),
      vehicleDepartment: String(obj.vehicleDepartment || ''),
      vehicleCostCentre: String(obj.vehicleCostCentre || ''),
      lastReplacementDate: obj.lastReplacementDate ? new Date(obj.lastReplacementDate).toISOString() : new Date().toISOString(),
      existingTireMake: String(obj.existingTireMake || ''),
      tireSize: String(obj.tireSize || ''),
      tireSizeRequired: String(obj.tireSizeRequired || 'N/A'),
      presentKmReading: Number(obj.presentKmReading || 0),
      previousKmReading: Number(obj.previousKmReading || 0),
      tireWearPattern: String(obj.tireWearPattern || ''),
      tireWearIndicatorAppeared: Boolean(obj.tireWearIndicatorAppeared || false),
      comments: String(obj.comments || ''),
      images: Array.isArray(obj.images) ? obj.images : [],
      status: String(obj.status || 'pending'),
      submittedAt: obj.submittedAt ? new Date(obj.submittedAt).toISOString() : new Date().toISOString(),
      deliveryOfficeName: String(obj.deliveryOfficeName || ''),
      deliveryStreetName: String(obj.deliveryStreetName || ''),
      deliveryTown: String(obj.deliveryTown || ''),
      totalPrice: Number(obj.totalPrice || 0),
      warrantyDistance: Number(obj.warrantyDistance || 0),
      customer_officer_note: String(obj.customer_officer_note || '')
    };

    // Add optional fields with proper type checking
    const optionalFields: Partial<TireRequest> = {
      ...(obj.supervisorApproved !== undefined && { supervisorApproved: Boolean(obj.supervisorApproved) }),
      ...(obj.supervisorNotes && { supervisorNotes: String(obj.supervisorNotes) }),
      ...(obj.supervisorTimestamp && { supervisorTimestamp: new Date(obj.supervisorTimestamp).toISOString() }),
      ...(obj.technicalManagerApproved !== undefined && { technicalManagerApproved: Boolean(obj.technicalManagerApproved) }),
      ...(obj.technicalManagerNotes && { technicalManagerNotes: String(obj.technicalManagerNotes) }),
      ...(obj.technicalManagerTimestamp && { technicalManagerTimestamp: new Date(obj.technicalManagerTimestamp).toISOString() }),
      ...(obj.engineerApproved !== undefined && { engineerApproved: Boolean(obj.engineerApproved) }),
      ...(obj.engineerNotes && { engineerNotes: String(obj.engineerNotes) }),
      ...(obj.engineerTimestamp && { engineerTimestamp: new Date(obj.engineerTimestamp).toISOString() }),
      ...(obj.orderPlaced !== undefined && { orderPlaced: Boolean(obj.orderPlaced) }),
      ...(obj.orderTimestamp && { orderTimestamp: new Date(obj.orderTimestamp).toISOString() })
    };

    return {
      id: typeof obj.id === 'string' ? parseInt(obj.id, 10) : obj.id || 0,
      vehicleId: obj.vehicleId ? (typeof obj.vehicleId === 'string' ? parseInt(obj.vehicleId, 10) : obj.vehicleId) : 0,
      ...baseRequest,
      ...optionalFields
    };
  } catch (error) {
    console.error('Error converting to TireRequest:', error);
    return null;
  }
};

const VehicleInquiry: FC = () => {
  const { requests: allRequests } = useRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<TireRequest[]>([]);

  const tireRequests = useMemo(() => {
    if (!Array.isArray(allRequests)) {
      console.error('Expected requests to be an array, got:', allRequests);
      return [];
    }
    
    return allRequests
      .map(safeToTireRequest)
      .filter((req): req is TireRequest => req !== null);
  }, [allRequests]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const uniqueVehicleNumbers = useMemo(() => {
    const numbers = new Set<string>();
    tireRequests.forEach(req => {
      if (req.vehicleNumber) {
        numbers.add(req.vehicleNumber);
      }
    });
    return Array.from(numbers).sort();
  }, [tireRequests]);

  const handleVehicleSelect = (vehicleNumber: string) => {
    setSearchTerm(vehicleNumber);
    setSelectedVehicle(vehicleNumber);
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

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setError('Please enter a vehicle number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const results = tireRequests.filter((req: TireRequest) => 
        req.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No requests found for this vehicle number');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error searching requests:', err);
      setError('An error occurred while searching. Please try again.');
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
            <input
              type="text"
              id="vehicleSearch"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter vehicle number"
              className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
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
