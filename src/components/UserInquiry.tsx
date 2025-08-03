import React, { useState, useEffect } from 'react';
// Request context is not needed here as we're using callbacks from props
import { apiUrls } from '../config/api';
import { Search, Filter, X } from 'lucide-react';

export interface UserInquiryProps {
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

const UserInquiry: React.FC<UserInquiryProps> = ({ onFilterChange, onReset }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [status, setStatus] = useState('');
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
  const [isLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch available vehicle numbers for autocomplete
  useEffect(() => {
    const fetchVehicleNumbers = async () => {
      try {
        const response = await fetch(apiUrls.vehicles());
        if (response.ok) {
          const data = await response.json();
          const numbers = data.map((vehicle: any) => vehicle.vehicleNumber);
          setAvailableVehicles(numbers);
        }
      } catch (error) {
        console.error('Error fetching vehicle numbers:', error);
      }
    };

    fetchVehicleNumbers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filters = {
      vehicleNumber: vehicleNumber || undefined,
      orderNumber: orderNumber || undefined,
      supplierName: supplierName || undefined,
      status: status || undefined,
    };
    onFilterChange(filters);
  };

  const handleReset = () => {
    setVehicleNumber('');
    setOrderNumber('');
    setSupplierName('');
    setStatus('');
    setShowFilters(false);
    onReset();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
          Request Inquiry
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <div className="relative">
              <input
                type="text"
                id="vehicleNumber"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                list="vehicleNumbers"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter vehicle number"
              />
              <datalist id="vehicleNumbers">
                {availableVehicles.map((number) => (
                  <option key={number} value={number} />
                ))}
              </datalist>
            </div>
          </div>

          {showFilters && (
            <>
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter order number"
                />
              </div>

              <div>
                <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  id="supplierName"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter supplier name"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="supervisor approved">Supervisor Approved</option>
                  <option value="technical-manager approved">Technical Manager Approved</option>
                  <option value="engineer approved">Engineer Approved</option>
                  <option value="customer-officer approved">Customer Officer Approved</option>
                  <option value="order placed">Order Placed</option>
                  <option value="complete">Complete</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInquiry;
