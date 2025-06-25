import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, CheckCircle, XCircle, Clock, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Request } from '../types/request';

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        icon: <Clock className="w-4 h-4" />,
      };
    case 'approved':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-300',
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    case 'rejected':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-300',
        icon: <XCircle className="w-4 h-4" />,
      };
    case 'complete':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-300',
        icon: <CheckCircle className="w-4 h-4" />,
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-300',
        icon: <Clock className="w-4 h-4" />,
      };
  }
};

interface RequestTableProps{
  requests: Request[];
  title: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (request: Request) => void;
  showActions?: boolean;
}

const RequestTable: React.FC<RequestTableProps> = ({
  requests,
  title,
  onApprove,
  onReject,
  onView,
  showActions = true,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Request>('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSort = (field: keyof Request) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Sort and paginate the requests
  const sortedRequests = [...requests].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    const numA = Number(aValue);
    const numB = Number(bValue);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    }
    
    return 0;
  });

  const totalPages = Math.ceil(requests.length / requestsPerPage);
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = sortedRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm text-gray-500">{requests.length} requests</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  className="flex items-center space-x-1 text-left"
                  onClick={() => handleSort('submittedAt')}
                >
                  <span>Date</span>
                  {sortField === 'submittedAt' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  className="flex items-center space-x-1 text-left"
                  onClick={() => handleSort('requesterName')}
                >
                  <span>Requester</span>
                  {sortField === 'requesterName' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
              <th className="w-8 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRequests.map((request) => (
              <React.Fragment key={request.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(request.submittedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{request.vehicleNumber}</div>
                    <div className="text-sm text-gray-500">
                      {request.vehicleBrand} {request.vehicleModel}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{request.requesterName}</div>
                    <div className="text-sm text-gray-500">{request.userSection}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${getStatusStyles(request.status).bg}
                        ${getStatusStyles(request.status).text}
                        ${getStatusStyles(request.status).border}
                        border
                      `}
                    >
                      {getStatusStyles(request.status).icon}
                      <span className="ml-1">{request.status}</span>
                    </span>
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => onView(request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprove(request.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onReject(request.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleRow(request.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedRows.has(request.id) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedRows.has(request.id) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900 mb-3 pb-1 border-b">Tire Details</h4>
                          <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">Size Required:</span> {request.tireSizeRequired || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Current Size:</span> {request.tireSize || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Quantity:</span> {request.quantity || '0'}</p>
                            <p className="text-sm"><span className="font-medium">Tubes Quantity:</span> {request.tubesQuantity || '0'}</p>
                            <p className="text-sm"><span className="font-medium">Current Make:</span> {request.existingTireMake || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Last Replaced:</span> {request.lastReplacementDate ? new Date(request.lastReplacementDate).toLocaleDateString() : '-'}</p>
                            <p className="text-sm"><span className="font-medium">Wear Pattern:</span> {request.tireWearPattern || '-'}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-semibold text-gray-900 mb-3 pb-1 border-b">Request Info</h4>
                          <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">Reason:</span> {request.requestReason || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Department:</span> {request.userSection || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Cost Center:</span> {request.costCenter || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Requester Name:</span> {request.requesterName || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Email:</span> {request.requesterEmail || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Phone:</span> {request.requesterPhone || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Comments:</span> {request.comments || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Submitted:</span> {new Date(request.submittedAt).toLocaleString()}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-semibold text-gray-900 mb-3 pb-1 border-b">Vehicle Info</h4>
                          <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">Vehicle ID:</span> {request.vehicleId || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Number:</span> {request.vehicleNumber || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Brand:</span> {request.vehicleBrand || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Model:</span> {request.vehicleModel || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Year:</span> {request.year || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Current KM:</span> {request.presentKmReading?.toLocaleString() || '0'}</p>
                            <p className="text-sm"><span className="font-medium">Previous KM:</span> {request.previousKmReading?.toLocaleString() || '0'}</p>
                            <p className="text-sm"><span className="font-medium">KM Difference:</span> {((request.presentKmReading || 0) - (request.previousKmReading || 0)).toLocaleString()}</p>
                          </div>
                        </div>

                        {request.images && request.images.length > 0 && (
                          <div className="col-span-full mt-4">
                            <h4 className="text-base font-semibold text-gray-900 mb-3 pb-1 border-b">Images</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {request.images.map((img: string, index: number) => (
                                <div key={index} className="aspect-square relative rounded-lg overflow-hidden border">
                                  <img
                                    src={img}
                                    alt={`Tire image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {indexOfFirstRequest + 1} to {Math.min(indexOfLastRequest, requests.length)} of {requests.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestTable;
