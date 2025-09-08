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
  CheckCircle,
  AlertCircle,
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
  deletedByRole: string | null;
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
  const [details, setDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [showAllFields, setShowAllFields] = useState<boolean>(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);
  const [showRestoreError, setShowRestoreError] = useState(false);
  const [restoreErrorMessage, setRestoreErrorMessage] = useState('');
  const [restoreSuccessMessage, setRestoreSuccessMessage] = useState('');

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
      // IMPORTANT: use /api/requests prefix from apiUrls.requests()
      const requestsBase = apiUrls.requests();
      const endpoint = userIdFilter 
        ? `${requestsBase}/deleted/user/${userIdFilter}`
        : `${requestsBase}/deleted`;

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

  // Fetch full details for the selected deleted request
  useEffect(() => {
    const fetchDetails = async (id: number) => {
      try {
        setDetailsLoading(true);
        setDetailsError(null);
        setDetails(null);
        const resp = await fetch(`${apiUrls.requests()}/deleted/${id}`);
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data.message || 'Failed to load deleted request');
        }
        setDetails(data.data);
      } catch (e: any) {
        setDetailsError(e.message || 'Failed to load details');
      } finally {
        setDetailsLoading(false);
      }
    };

    if (selectedRequest) {
      fetchDetails(selectedRequest.id);
    } else {
      setDetails(null);
      setDetailsError(null);
      setDetailsLoading(false);
    }
  }, [selectedRequest]);

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
      console.log('🔄 Attempting to restore request ID:', restoreId);
      
      const response = await fetch(`${apiUrls.requests()}/restore/${restoreId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          userRole: user?.role,
        }),
      });

      console.log('📡 Restore response status:', response.status);
      const data = await response.json();
      console.log('📦 Restore response data:', data);

      if (data.success) {
        console.log('✅ Request restored successfully');
        setRestoreSuccessMessage('Request restored successfully! The request has been moved back to the active requests list.');
        setShowRestoreSuccess(true);
        fetchDeletedRequests(); // Refresh the list
      } else {
        console.error('❌ Failed to restore request:', data.message);
        // Handle role-based authorization errors with more specific messaging
        if (response.status === 403) {
          setRestoreErrorMessage(`Access Denied: ${data.message}\n\nOnly users with '${data.deletedByRole}' role can restore this request.\nYour current role: '${data.userRole}'`);
        } else {
          setRestoreErrorMessage(`Failed to restore request: ${data.message}`);
        }
        setShowRestoreError(true);
      }
    } catch (error) {
      console.error('❌ Error restoring request:', error);
      setRestoreErrorMessage(`Error restoring request: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setShowRestoreError(true);
    }

    setShowRestoreConfirm(false);
    setRestoreId(null);
  };

  // Cancel restore
  const cancelRestore = () => {
    setShowRestoreConfirm(false);
    setRestoreId(null);
  };

  // Get status text with proper display labels
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'complete':
        return 'Engineer Approved';
      case 'engineer approved':
        return 'Engineer Approved';
      default:
        return status;
    }
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
      case 'engineer approved':
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
      case 'engineer approved':
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

  // Check if current user can restore a specific request
  const canUserRestoreRequest = (request: DeletedRequest): boolean => {
    // If no deletedByRole is tracked, allow restoration (backward compatibility)
    if (!request.deletedByRole) {
      return true;
    }
    
    // Only allow restoration if user's role matches the deletedByRole
    return user?.role === request.deletedByRole;
  };

  // Get role-based restore tooltip message
  const getRestoreTooltip = (request: DeletedRequest): string => {
    if (!request.deletedByRole) {
      return "Restore Request";
    }
    
    if (user?.role === request.deletedByRole) {
      return "Restore Request";
    }
    
    const roleDisplayName = request.deletedByRole === 'technical-manager' ? 'Technical Manager' :
                           request.deletedByRole === 'customer-officer' ? 'Customer Officer' :
                           request.deletedByRole.charAt(0).toUpperCase() + request.deletedByRole.slice(1);
    
    return `Only ${roleDisplayName}s can restore this request (deleted by ${roleDisplayName})`;
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
                  <option value="complete">Engineer Approved</option>
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
                <tr
                  key={request.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedRequest(request);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`View deleted request ${request.vehicleNumber}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{request.vehicleNumber}</div>
                      <div className="text-xs text-gray-500">{request.vehicleBrand} {request.vehicleModel}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{getStatusText(request.status)}</span>
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
                    <div className="text-sm text-gray-900">
                      {request.deletedByRole ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.deletedByRole === 'user' ? 'bg-blue-100 text-blue-800' :
                          request.deletedByRole === 'supervisor' ? 'bg-green-100 text-green-800' :
                          request.deletedByRole === 'technical-manager' ? 'bg-purple-100 text-purple-800' :
                          request.deletedByRole === 'engineer' ? 'bg-orange-100 text-orange-800' :
                          request.deletedByRole === 'customer-officer' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.deletedByRole === 'technical-manager' ? 'Tech Manager' :
                           request.deletedByRole === 'customer-officer' ? 'Customer Officer' :
                           request.deletedByRole.charAt(0).toUpperCase() + request.deletedByRole.slice(1)
                          }
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Not tracked</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {showRestoreButton && request.canRestore && canUserRestoreRequest(request) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRestore(request.id); }}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title={getRestoreTooltip(request)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      {showRestoreButton && request.canRestore && !canUserRestoreRequest(request) && (
                        <button
                          disabled
                          className="text-gray-400 p-1 rounded cursor-not-allowed opacity-50"
                          title={getRestoreTooltip(request)}
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
            
            {/* Role-based authorization notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                <strong>Role-based Security:</strong> Only users with the same role as the person who deleted this request can restore it.
                {restoreId && (() => {
                  const targetRequest = requests.find(r => r.id === restoreId);
                  if (targetRequest?.deletedByRole) {
                    const roleDisplay = targetRequest.deletedByRole === 'technical-manager' ? 'Technical Manager' :
                                       targetRequest.deletedByRole === 'customer-officer' ? 'Customer Officer' :
                                       targetRequest.deletedByRole.charAt(0).toUpperCase() + targetRequest.deletedByRole.slice(1);
                    return ` This request was deleted by a ${roleDisplay}, so only ${roleDisplay}s can restore it.`;
                  }
                  return '';
                })()}
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

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Deleted Request Details</h3>
                <p className="text-sm text-gray-600">Vehicle {selectedRequest.vehicleNumber}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading && (
              <div className="py-8 text-center text-gray-600">Loading...</div>
            )}
            {detailsError && (
              <div className="py-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded">{detailsError}</div>
            )}
            {details && (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                {/* Primary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Requester</div>
                    <div className="text-sm text-gray-900">{details.requesterName}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="text-sm text-gray-900">{getStatusText(details.status)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Department</div>
                    <div className="text-sm text-gray-900">{details.Department || '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Cost Center</div>
                    <div className="text-sm text-gray-900">{details.CostCenter || '-'}</div>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Vehicle</div>
                    <div className="text-sm text-gray-900">{details.vehicleNumber} — {details.vehicleBrand} {details.vehicleModel}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Tire Size</div>
                    <div className="text-sm text-gray-900">{details.tireSize}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Quantity</div>
                    <div className="text-sm text-gray-900">{details.quantity} ({details.tubesQuantity} tubes)</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Existing Tire Make</div>
                    <div className="text-sm text-gray-900">{details.existingTireMake}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Required Tire Size</div>
                    <div className="text-sm text-gray-900">{details.tireSizeRequired}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Last Replacement</div>
                    <div className="text-sm text-gray-900">{details.lastReplacementDate ? new Date(details.lastReplacementDate).toLocaleDateString() : '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Present Km</div>
                    <div className="text-sm text-gray-900">{details.presentKmReading}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Previous Km</div>
                    <div className="text-sm text-gray-900">{details.previousKmReading}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border md:col-span-2">
                    <div className="text-xs text-gray-500">Tire Wear Pattern</div>
                    <div className="text-sm text-gray-900">{details.tireWearPattern}</div>
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Submitted At</div>
                    <div className="text-sm text-gray-900">{details.submittedAt ? formatDate(details.submittedAt) : '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Deleted At</div>
                    <div className="text-sm text-gray-900">{details.deletedAt ? formatDate(details.deletedAt) : '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Deleted By (ID)</div>
                    <div className="text-sm text-gray-900">{details.deletedBy ?? 'System'}</div>
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Requester Email</div>
                    <div className="text-sm text-gray-900 break-all">{details.requesterEmail}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Requester Phone</div>
                    <div className="text-sm text-gray-900">{details.requesterPhone}</div>
                  </div>
                </div>

                {/* Notes & Reason */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border md:col-span-2">
                    <div className="text-xs text-gray-500">Reason</div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">{details.requestReason}</div>
                  </div>
                  {details.supervisor_notes && (
                    <div className="p-3 bg-gray-50 rounded border md:col-span-2">
                      <div className="text-xs text-gray-500">Supervisor Notes</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{details.supervisor_notes}</div>
                    </div>
                  )}
                  {details.technical_manager_note && (
                    <div className="p-3 bg-gray-50 rounded border md:col-span-2">
                      <div className="text-xs text-gray-500">Technical Manager Note</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{details.technical_manager_note}</div>
                    </div>
                  )}
                  {details.engineer_note && (
                    <div className="p-3 bg-gray-50 rounded border md:col-span-2">
                      <div className="text-xs text-gray-500">Engineer Note</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{details.engineer_note}</div>
                    </div>
                  )}
                  {details.customer_officer_note && (
                    <div className="p-3 bg-gray-50 rounded border md:col-span-2">
                      <div className="text-xs text-gray-500">Customer Officer Note</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{details.customer_officer_note}</div>
                    </div>
                  )}
                </div>

                {/* Order & Supplier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Supplier Name</div>
                    <div className="text-sm text-gray-900">{details.supplierName || '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Supplier Email</div>
                    <div className="text-sm text-gray-900 break-all">{details.supplierEmail || '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Supplier Phone</div>
                    <div className="text-sm text-gray-900">{details.supplierPhone || '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Order Number</div>
                    <div className="text-sm text-gray-900">{details.orderNumber || '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Order Placed</div>
                    <div className="text-sm text-gray-900">{details.orderPlacedDate ? formatDate(details.orderPlacedDate) : '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border md:col-span-2">
                    <div className="text-xs text-gray-500">Order Notes</div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">{details.orderNotes || '-'}</div>
                  </div>
                </div>

                {/* Delivery & Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Delivery Office</div>
                    <div className="text-sm text-gray-900">{details.deliveryOfficeName || '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Delivery Street</div>
                    <div className="text-sm text-gray-900">{details.deliveryStreetName || '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Delivery Town</div>
                    <div className="text-sm text-gray-900">{details.deliveryTown || '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Total Price</div>
                    <div className="text-sm text-gray-900">{details.totalPrice ?? '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Warranty Distance</div>
                    <div className="text-sm text-gray-900">{details.warrantyDistance ?? '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Wear Indicator Appeared</div>
                    <div className="text-sm text-gray-900">{details.tireWearIndicatorAppeared ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                {/* Decisions (IDs) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Supervisor ID</div>
                    <div className="text-sm text-gray-900">{details.supervisorId}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Technical Manager ID</div>
                    <div className="text-sm text-gray-900">{details.technical_manager_id ?? '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Supervisor Decision By</div>
                    <div className="text-sm text-gray-900">{details.supervisor_decision_by ?? '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Engineer Decision By</div>
                    <div className="text-sm text-gray-900">{details.engineer_decision_by ?? '-'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500">Customer Officer Decision By</div>
                    <div className="text-sm text-gray-900">{details.customer_officer_decision_by ?? '-'}</div>
                  </div>
                </div>

                {/* All columns (raw) */}
                <div className="border rounded-lg">
                  <button
                    onClick={() => setShowAllFields(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                  >
                    <span className="text-sm font-medium text-gray-800">All Fields from requestbackup</span>
                    <span className="text-xs text-gray-600">{showAllFields ? 'Hide' : 'Show'}</span>
                  </button>
                  {showAllFields && (
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(details)
                        .filter(([k, v]) => k !== 'images' && k !== 'isDeleted')
                        .map(([key, value]) => (
                          <div key={key} className="p-3 bg-white rounded border">
                            <div className="text-[11px] uppercase tracking-wide text-gray-500">{key}</div>
                            <div className="text-sm text-gray-900 break-words">
                              {value === null || value === undefined || value === '' ? '-' : String(value)}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Images */}
                {Array.isArray(details.images) && details.images.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Images</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {details.images.map((src: string, idx: number) => (
                        <img key={idx} src={src} alt={`Request Image ${idx + 1}`} className="w-full h-32 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restore Success Modal */}
      {showRestoreSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Restore Successful</h3>
                <p className="text-sm text-gray-600">The request has been restored successfully.</p>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800">
                {restoreSuccessMessage}
              </p>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowRestoreSuccess(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>OK</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Error Modal */}
      {showRestoreError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Restore Failed</h3>
                <p className="text-sm text-gray-600">The request could not be restored.</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 whitespace-pre-line">
                {restoreErrorMessage}
              </p>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowRestoreError(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>OK</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedRequestsTable;




