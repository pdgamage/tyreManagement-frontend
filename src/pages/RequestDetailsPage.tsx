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
  // Add other fields from your request model as needed
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
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
    
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('approved') || statusLower === 'complete') {
      return 'bg-green-100 text-green-800';
    }
    
    if (statusLower.includes('rejected')) {
      return 'bg-red-100 text-red-800';
    }
    
    if (statusLower.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Request</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Not Found</h2>
          <p className="text-gray-600 mb-6">The requested tire request could not be found.</p>
          <button
            onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Tire Request Details</h1>
            <div className="ml-auto flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-1.5">{request.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Request #{request.id}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Request details and information
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Vehicle Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                  <Truck className="w-5 h-5 text-gray-400 mr-2" />
                  {request.vehicleNumber}
                </dd>
              </div>
              
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {request.orderNumber || 'The order has not yet been placed with a supplier'}
                </dd>
              </div>
              
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Request Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(request.requestDate || request.submittedAt).toLocaleDateString()}
                </dd>
              </div>
              
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Supplier</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="font-medium">{request.supplierName || 'The order has not yet been placed with a supplier'}</div>
                  {request.supplierPhone && (
                    <div className="mt-1 flex items-center">
                      <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${request.supplierPhone}`} className="text-blue-600 hover:text-blue-800">
                        {request.supplierPhone}
                      </a>
                    </div>
                  )}
                  {request.supplierEmail && (
                    <div className="mt-1 flex items-center">
                      <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${request.supplierEmail}`} className="text-blue-600 hover:text-blue-800">
                        {request.supplierEmail}
                      </a>
                    </div>
                  )}
                </dd>
              </div>
              
              {/* Add more request details here as needed */}
              
            </dl>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(location.state?.fromInquiry ? '/user/inquiry-dashboard' : '/user/dashboard')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to {location.state?.fromInquiry ? 'Inquiry' : 'Dashboard'}
          </button>
          
          {/* Add more action buttons as needed */}
          
        </div>
      </main>
    </div>
  );
};

export default RequestDetailsPage;
