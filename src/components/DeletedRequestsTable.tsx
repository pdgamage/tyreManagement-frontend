import React, { useState, useEffect } from 'react';
import {
  Filter,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  Calendar,
  User,
  Car,
  AlertTriangle,
  Eye,
  X,
  RefreshCw,
  Archive,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { apiUrls } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface DeletedRequest {
  id: number;
  vehicleNumber: string;
  status: string;
  requesterName: string;
  submittedAt: string;
  deletedAt: string;
  deletedBy: number | null;
  deletedByName: string | null;
  daysSinceDeleted: number;
  vehicleBrand: string;
  vehicleModel: string;
  tireSize: string;
  quantity: number;
  tubesQuantity: number;
  requestReason: string;
  images: string[];
  isDeleted: boolean;
  canRestore: boolean;
}

interface Filters {
  vehicleNumber: string;
  status: string;
  requesterName: string;
  startDate: string;
  endDate: string;
  deletedBy: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface DeletedRequestsTableProps {
  userIdFilter?: number;
  showRestoreButton?: boolean;
  title?: string;
}

const DeletedRequestsTable: React.FC<DeletedRequestsTableProps> = ({
  userIdFilter,
  showRestoreButton = true,
  title = 'Deleted Requests'
}) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DeletedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DeletedRequest | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreId, setRestoreId] = useState<number | null>(null);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    vehicleNumber: '',
    status: '',
    requesterName: '',
    startDate: '',
    endDate: '',
    deletedBy: '',
  });

  // Pagination and sorting state
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [sortBy, setSortBy] = useState('deletedAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Fetch deleted requests with current filters and pagination
  const fetchDeletedRequests = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      // Use user-specific endpoint if userIdFilter is provided
      const endpoint = userIdFilter 
        ? `${apiUrls.base}/requests/deleted/user/${userIdFilter}`
        : `${apiUrls.base}/requests/deleted`;

      console.log('🔍 Fetching deleted requests from:', endpoint);
      console.log('🔍 With params:', params.toString());
      console.log('🔍 User ID filter:', userIdFilter);

      const response = await fetch(`${endpoint}?${params.toString()}`);
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        setRequests(data.data);
        setPagination(data.pagination);
        console.log('✅ Successfully set requests:', data.data.length, 'items');
      } else {
        console.error('❌ Failed to fetch deleted requests:', data.message);
        setRequests([]);
      }
    } catch (error) {
      console.error('❌ Error fetching deleted requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDeletedRequests();
  }, [pagination.page, pagination.limit, sortBy, sortOrder, userIdFilter]);

  // Fetch data when filters change
  useEffect(() => {
    // Reset to page 1 when filters change
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      fetchDeletedRequests();
    }
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      vehicleNumber: '',
      status: '',
      requesterName: '',
      startDate: '',
      endDate: '',
      deletedBy: '',
    });
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle restore request
  const handleRestore = (id: number) => {
    setRestoreId(id);
    setShowRestoreConfirm(true);
  };

  // Confirm restore
  const confirmRestore = async () => {
    if (!restoreId) return;

    try {
      const response = await fetch(`${apiUrls.base}/requests/restore/${restoreId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Request restored successfully');
        fetchDeletedRequests(); // Refresh the list
      } else {
        console.error('❌ Failed to restore request:', data.message);
      }
    } catch (error) {
      console.error('❌ Error restoring request:', error);
    }

    setShowRestoreConfirm(false);
    setRestoreId(null);
  };

  // Cancel restore
  const cancelRestore = () => {
    setShowRestoreConfirm(false);
    setRestoreId(null);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'supervisor approved':
      case 'technical-manager approved':
      case 'engineer approved':
      case 'customer-officer approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'supervisor rejected':
      case 'technical-manager rejected':
      case 'engineer rejected':
      case 'customer-officer rejected':
        return 'bg-red-100 text-red-800';
      case 'complete':
        return 'bg-blue-100 text-blue-800';
      case 'order placed':
        return 'bg-purple-100 text-purple-800';
      case 'order cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
      case 'supervisor approved':
      case 'technical-manager approved':
      case 'engineer approved':
      case 'customer-officer approved':
      case 'complete':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
      case 'supervisor rejected':
      case 'technical-manager rejected':
      case 'engineer rejected':
      case 'customer-officer rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Archive className="w-5 h-5" />
              <span>{title}</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: {pagination.total} deleted requests
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            <button
              onClick={fetchDeletedRequests}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters Panel - Part 1 of 2 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Vehicle Number Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vehicle..."
                    value={filters.vehicleNumber}
                    onChange={(e) => handleFilterChange('vehicleNumber', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="supervisor approved">Supervisor Approved</option>
                  <option value="technical-manager approved">Technical Manager Approved</option>
                  <option value="engineer approved">Engineer Approved</option>
                  <option value="approved">Approved</option>
                  <option value="complete">Complete</option>
                  <option value="order placed">Order Placed</option>
                  <option value="rejected">Rejected</option>
                  <option value="supervisor rejected">Supervisor Rejected</option>
                  <option value="technical-manager rejected">Technical Manager Rejected</option>
                  <option value="engineer rejected">Engineer Rejected</option>
                  <option value="order cancelled">Order Cancelled</option>
                </select>
              </div>

              {/* Requester Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requester Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requester..."
                    value={filters.requesterName}
                    onChange={(e) => handleFilterChange('requesterName', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deleted From
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deleted To
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deleted requests found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters to see more results.'
                : 'No requests have been deleted yet.'
              }
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('vehicleNumber')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Vehicle</span>
                    {sortBy === 'vehicleNumber' && (
                      sortOrder === 'ASC' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Status</span>
                    {sortBy === 'status' && (
                      sortOrder === 'ASC' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('requesterName')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Requester</span>
                    {sortBy === 'requesterName' && (
                      sortOrder === 'ASC' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('submittedAt')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Submitted</span>
                    {sortBy === 'submittedAt' && (
                      sortOrder === 'ASC' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('deletedAt')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Deleted</span>
                    {sortBy === 'deletedAt' && (
                      sortOrder === 'ASC' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deleted By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{request.vehicleNumber}</div>
                      <div className="text-xs text-gray-500">{request.vehicleBrand} {request.vehicleModel}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.requesterName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(request.submittedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(request.deletedAt)}</div>
                    <div className="text-xs text-gray-500">{request.daysSinceDeleted} days ago</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.deletedByName || 'System'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {showRestoreButton && request.canRestore && (
                        <button
                          onClick={() => handleRestore(request.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Restore Request"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + Math.max(1, pagination.page - 2);
                  if (page <= pagination.totalPages) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          page === pagination.page
                            ? 'bg-red-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Restore</h3>
                <p className="text-sm text-gray-600">Are you sure you want to restore this deleted request?</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                This action will move the request back to the active requests list with all its original data, images, and history preserved.
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={cancelRestore}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedRequestsTable;
