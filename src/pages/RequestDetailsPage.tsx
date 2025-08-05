import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, XCircle, Clock, Truck, Info, Calendar, Hash, User } from 'lucide-react';

interface RequestDetails {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  submittedAt: string;
  requestDate: string;
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  engineerName?: string;
  approvalDate?: string;
  remarks?: string;
  quantity?: number;
  tubesQuantity?: number;
  tireSize?: string;
}

const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch request details');
        }
        
        const data = await response.json();
        setRequest(data);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to load request details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('approved') || statusLower === 'complete') {
      return <CheckCircle className="w-5 h-5" />;
    }
    
    if (statusLower.includes('rejected')) {
      return <XCircle className="w-5 h-5" />;
    }
    
    if (statusLower.includes('pending')) {
      return <Clock className="w-5 h-5" />;
    }
    
    return <Info className="w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('approved') || statusLower === 'complete') {
      return {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        text: 'text-emerald-700',
        border: 'border border-emerald-200',
        icon: 'text-emerald-500'
      };
    }
    
    if (statusLower.includes('rejected')) {
      return {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        text: 'text-rose-700',
        border: 'border border-rose-200',
        icon: 'text-rose-500'
      };
    }
    
    if (statusLower.includes('pending')) {
      return {
        bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
        text: 'text-amber-700',
        border: 'border border-amber-200',
        icon: 'text-amber-500'
      };
    }
    
    return {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      text: 'text-indigo-700',
      border: 'border border-indigo-200',
      icon: 'text-indigo-500'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 border-opacity-50 animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Error Loading Request</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <button
              onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center space-y-6">
          <div className="p-3 bg-gray-100 rounded-full inline-flex">
            <Info className="w-10 h-10 text-gray-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Request Not Found</h2>
            <p className="text-gray-600">The requested tire request could not be found.</p>
          </div>
          <button
            onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getStatusColor(request.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">Tire Request Details</h1>
              <p className="text-sm text-blue-100 mt-1">Request ID: {request.id}</p>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                <span className={`mr-2 ${statusColors.icon}`}>
                  {getStatusIcon(request.status)}
                </span>
                <span className="capitalize">
                  {request.status.toLowerCase() === 'complete' ? 'Complete (Engineer Approved)' : request.status.toLowerCase()}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Request Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Request Information
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Detailed information about this tire request
                </p>
              </div>
              <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-200">
                <Calendar className="inline-block w-4 h-4 mr-1 -mt-1" />
                {new Date(request.submittedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          
          {/* Card Body */}
          <div className="divide-y divide-gray-200">
            {/* Basic Info Section */}
            <div className="py-6 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center mb-2">
                  <Truck className="w-5 h-5 text-blue-500 mr-2" />
                  <dt className="text-sm font-medium text-blue-700">Vehicle Number</dt>
                </div>
                <dd className="text-lg font-semibold text-gray-900">
                  {request.vehicleNumber}
                </dd>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center mb-2">
                  <Hash className="w-5 h-5 text-purple-500 mr-2" />
                  <dt className="text-sm font-medium text-purple-700">Order Number</dt>
                </div>
                <dd className="text-lg font-semibold text-gray-900">
                  {request.orderNumber || (
                    <span className="text-gray-400">The order has not yet been placed with a supplier</span>
                  )}
                </dd>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-amber-500 mr-2" />
                  <dt className="text-sm font-medium text-amber-700">Request Date</dt>
                </div>
                <dd className="text-lg font-semibold text-gray-900">
                  {new Date(request.requestDate || request.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </div>
            
            {/* Tire Details Section */}
            <div className="py-6 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center mb-2">
                  <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium mr-2">#</span>
                  <dt className="text-sm font-medium text-blue-700">Tire Quantity</dt>
                </div>
                <dd className="text-lg font-semibold text-gray-900">
                  {request.quantity || <span className="text-gray-400">-</span>}
                </dd>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center mb-2">
                  <span className="w-5 h-5 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-xs font-medium mr-2">#</span>
                  <dt className="text-sm font-medium text-green-700">Tubes Quantity</dt>
                </div>
                <dd className="text-lg font-semibold text-gray-900">
                  {request.tubesQuantity || <span className="text-gray-400">-</span>}
                </dd>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center mb-2">
                  <span className="w-5 h-5 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-xs font-medium mr-2">#</span>
                  <dt className="text-sm font-medium text-purple-700">Tire Size</dt>
                </div>
                <dd className="text-lg font-semibold text-gray-900">
                  {request.tireSize || <span className="text-gray-400">Not specified</span>}
                </dd>
              </div>
            </div>
            
            {/* Supplier Section */}
            <div className="py-6 px-6">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-indigo-500 mr-2" />
                <h4 className="text-base font-semibold text-gray-900">Supplier Information</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
                  <dt className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">Supplier Name</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {request.supplierName || (
                      <span className="text-gray-400">The order has not yet been placed with a supplier</span>
                    )}
                  </dd>
                </div>
                
                {request.supplierPhone && (
                  <div className="bg-gradient-to-br from-cyan-50 to-sky-50 p-4 rounded-xl border border-cyan-100">
                    <dt className="text-xs font-medium text-cyan-600 uppercase tracking-wider mb-1">Phone</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      <a href={`tel:${request.supplierPhone}`} className="flex items-center hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4 text-cyan-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {request.supplierPhone}
                      </a>
                    </dd>
                  </div>
                )}
                
                {request.supplierEmail && (
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
                    <dt className="text-xs font-medium text-pink-600 uppercase tracking-wider mb-1">Email</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      <a href={`mailto:${request.supplierEmail}`} className="flex items-center hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {request.supplierEmail}
                      </a>
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-medium text-sm shadow-lg hover:shadow-xl"
          >
            Back to {location.state?.fromInquiry ? 'Inquiries' : 'Dashboard'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default RequestDetailsPage;