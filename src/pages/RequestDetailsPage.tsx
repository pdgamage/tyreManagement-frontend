import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, XCircle, Clock, Truck, Info } from 'lucide-react';

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
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    if (statusLower.includes('rejected')) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    if (statusLower.includes('pending')) {
      return <Clock className="w-5 h-5 text-amber-500" />;
    }
    
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('approved') || statusLower === 'complete') {
      return 'bg-green-50 text-green-700 border border-green-100';
    }
    
    if (statusLower.includes('rejected')) {
      return 'bg-red-50 text-red-700 border border-red-100';
    }
    
    if (statusLower.includes('pending')) {
      return 'bg-amber-50 text-amber-700 border border-amber-100';
    }
    
    return 'bg-gray-50 text-gray-700 border border-gray-100';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800">Error Loading Request</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Request Not Found</h2>
          <p className="text-gray-600">The requested tire request could not be found.</p>
          <button
            onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 truncate">Tire Request Details</h1>
              <p className="text-sm text-gray-500 mt-1">Request ID: {request.id}</p>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-1.5 capitalize">{request.status.toLowerCase()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Request Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Detailed information about this tire request
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Submitted on {new Date(request.submittedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="py-5 px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Vehicle Number</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                  <Truck className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="truncate">{request.vehicleNumber}</span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {request.orderNumber || (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Request Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(request.requestDate || request.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </div>
            
            <div className="py-5 px-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Supplier Information</h4>
              <div className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Supplier Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {request.supplierName || (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </dd>
                </div>
                
                {request.supplierPhone && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <svg className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${request.supplierPhone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {request.supplierPhone}
                      </a>
                    </dd>
                  </div>
                )}
                
                {request.supplierEmail && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <svg className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${request.supplierEmail}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {request.supplierEmail}
                      </a>
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
            className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Back to {location.state?.fromInquiry ? 'Inquiries' : 'Dashboard'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default RequestDetailsPage;