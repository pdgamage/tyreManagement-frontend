import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Autosuggest from 'react-autosuggest';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface Vehicle {
  vehicleNumber: string;
  make: string;
  model: string;
}

interface Supplier {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Request {
  id: number;
  status: string;
  createdAt: string;
  Supplier?: Supplier;
}

interface SearchResult {
  vehicle: Vehicle;
  requests: Request[];
}

const VehicleSearch: React.FC = () => {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Vehicle[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = async (value: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vehicles/suggestions?query=${value}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  const onSuggestionsFetchRequested = async ({ value }: { value: string }) => {
    setSuggestions(await getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: Vehicle) => suggestion.vehicleNumber;

  const renderSuggestion = (suggestion: Vehicle) => (
    <div className="p-2 hover:bg-gray-100">
      <div className="font-medium">{suggestion.vehicleNumber}</div>
      <div className="text-sm text-gray-600">{suggestion.make} {suggestion.model}</div>
    </div>
  );

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/vehicles/search?vehicleNumber=${value}`);
      setSearchResult(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred while searching');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (_: any, { newValue }: { newValue: string }) => {
    setValue(newValue);
  };

  const inputProps = {
    placeholder: 'Enter vehicle number',
    value,
    onChange,
    className: 'w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Vehicle Search</h2>
        <div className="flex gap-2">
          <div className="flex-grow">
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              inputProps={inputProps}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {searchResult && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Vehicle Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Vehicle Number</p>
                <p className="font-medium">{searchResult.vehicle.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Make & Model</p>
                <p className="font-medium">{searchResult.vehicle.make} {searchResult.vehicle.model}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Request History</h3>
            {searchResult.requests.length > 0 ? (
              <div className="space-y-4">
                {searchResult.requests.map((request) => (
                  <div key={request.id} className="border-b pb-4">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-gray-600">Request ID</p>
                        <p className="font-medium">#{request.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-medium">{request.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created At</p>
                        <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {/* Only show supplier details for authenticated users */}
                    {user?.role === 'supervisor' && request.Supplier && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-700 mb-2">Supplier Details:</p>
                        <div className="bg-gray-50 p-3 rounded">
                          <p><span className="font-medium">Name:</span> {request.Supplier.name}</p>
                          <p><span className="font-medium">Email:</span> {request.Supplier.email}</p>
                          <p><span className="font-medium">Phone:</span> {request.Supplier.phone}</p>
                          <p><span className="font-medium">Address:</span> {request.Supplier.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No requests found for this vehicle.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSearch;
