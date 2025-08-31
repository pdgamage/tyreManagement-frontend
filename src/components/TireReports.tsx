import React, { useState } from 'react';
import { Calendar, Filter, X, FileDown } from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';

interface TireReportsProps {
  requests: any[];
  onApplyFilters: (filters: {
    dateFrom: string;
    dateTo: string;
    status: string;
    searchQuery: string;
  }) => void;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  status: string;
  searchQuery: string;
}

const TireReports: React.FC<TireReportsProps> = ({ requests, onApplyFilters }) => {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    searchQuery: ''
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
    setIsFilterOpen(false);
  };

  const handleExport = () => {
    let filename = 'tire_requests';
    if (filters.dateFrom || filters.dateTo) {
      filename += '_' + (filters.dateFrom || 'start') + '_to_' + (filters.dateTo || 'end');
    }
    if (filters.status !== 'all') {
      filename += '_' + filters.status.replace(/\s+/g, '_');
    }
    exportToExcel(requests, filename);
  };

  const clearFilters = () => {
    const resetFilters = {
      dateFrom: '',
      dateTo: '',
      status: 'all',
      searchQuery: ''
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  // Calculate summary statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status?.toLowerCase().includes('pending')).length,
    approved: requests.filter(r => r.status?.toLowerCase().includes('approved')).length,
    rejected: requests.filter(r => r.status?.toLowerCase().includes('rejected')).length,
    completed: requests.filter(r => r.status?.toLowerCase().includes('complete')).length
  };

  // Extra status note for clarity in list/table views
  const getStatusExtraText = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') {
      return ' - user tire requested';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Requests</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-yellow-600">Pending</div>
          <div className="mt-2 text-3xl font-semibold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-green-600">Approved</div>
          <div className="mt-2 text-3xl font-semibold text-green-700">{stats.approved}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-red-600">Rejected</div>
          <div className="mt-2 text-3xl font-semibold text-red-700">{stats.rejected}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-blue-600">Completed</div>
          <div className="mt-2 text-3xl font-semibold text-blue-700">{stats.completed}</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Report Filters</h3>
              <p className="mt-1 text-sm text-gray-500">
                Use the filters below to generate specific reports
              </p>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <form onSubmit={handleFilterSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date-from" className="block text-sm font-medium text-gray-700">
                    Date From
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date-from"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="date-to" className="block text-sm font-medium text-gray-700">
                    Date To
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date-to"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="complete">Complete</option>
                </select>
              </div>

              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder="Search by order number, supplier..."
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Results Section */}
      {requests.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Results</h4>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export to Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.orderNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.vehicleNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${
                            request.status?.toLowerCase().includes('pending')
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status?.toLowerCase().includes('approved')
                              ? 'bg-green-100 text-green-800'
                              : request.status?.toLowerCase().includes('rejected')
                              ? 'bg-red-100 text-red-800'
                              : request.status?.toLowerCase().includes('complete')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {request.status}
                          {getStatusExtraText(request.status) && (
                            <span className="ml-1 text-[11px] opacity-80">
                              {getStatusExtraText(request.status)}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.supplierName || 'Not assigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 text-center rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500">No results match your filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default TireReports;
