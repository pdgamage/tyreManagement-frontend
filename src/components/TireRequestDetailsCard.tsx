import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Request } from '../types/request';

interface TireRequestDetailsCardProps {
  request: Request;
  fromInquiry?: boolean;
}

const TireRequestDetailsCard: React.FC<TireRequestDetailsCardProps> = ({ request, fromInquiry }) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(fromInquiry ? '/user/inquiry-dashboard' : '/user')}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Tire Request Details</h1>
              <div className="flex items-center gap-2 text-gray-300 text-sm mt-1">
                <span>Request ID: {request.id}</span>
                <span>•</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
            <div className="ml-auto">
              <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full">
                Order Placed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Information</h2>
            <p className="text-gray-600 mb-6">Detailed information about this tire request</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Vehicle Number */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">Vehicle Number</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{request.vehicleNumber}</span>
              </div>

              {/* Order Number */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-900">Order Number</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{request.id}</span>
              </div>

              {/* Order Status */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-amber-900">Order Status</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {request.order_placed ? 'Order Placed' : 'Not placed yet'}
                </span>
              </div>

              {/* Request Date */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-green-900">Request Date</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {formatDate(request.submittedAt.toString())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate(fromInquiry ? '/user/inquiry-dashboard' : '/user')}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TireRequestDetailsCard;
