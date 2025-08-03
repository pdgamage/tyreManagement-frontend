import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Search,
  Truck,
  Info,
  AlertCircle,
} from 'lucide-react';
import type { Vehicle, Request } from '../types/vehicle';

const VehicleInquiry = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VEHICLES}`);
      const data = await response.json() as Vehicle[];
      setVehicles(data);
    } catch (error) {
      setError('Error fetching vehicles. Please try again.');
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedVehicle) {
      setError('Please select a vehicle');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate.toISOString().split('T')[0]);
      if (endDate) queryParams.append('endDate', endDate.toISOString().split('T')[0]);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS_BY_VEHICLE}/${selectedVehicle}?${queryParams.toString()}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data);
        setFilteredRequests(data);
      } else {
        setError(data.message || 'Error fetching requests');
      }
    } catch (error) {
      setError('Error searching requests. Please try again.');
      console.error('Error searching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const filtered = requests.filter((req) => {
      const requestDate = new Date(req.created_at);
      return requestDate >= startDate && requestDate <= endDate;
    });
    setFilteredRequests(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Vehicle Inquiry</h1>
                <p className="text-slate-300">Search and view tire request history</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.vehicle_number}>
                      {vehicle.vehicle_number}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholderText="Select start date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholderText="Select end date"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>{loading ? 'Searching...' : 'Search'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          {filteredRequests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Request History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(request.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'complete' ? 'bg-green-100 text-green-800' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.orderNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.supplier_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.supplier_phone || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredRequests.length === 0 && !loading && !error && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-gray-200">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Found</h3>
              <p className="text-gray-500">
                Select a vehicle and date range to view tire request history
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VehicleInquiry;
