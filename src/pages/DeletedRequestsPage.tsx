import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DeletedRequestsTable from '../components/DeletedRequestsTable';

const DeletedRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Navigate back based on user role
    switch (user?.role) {
      case 'user':
        navigate('/user');
        break;
      case 'supervisor':
        navigate('/supervisor');
        break;
      case 'technical-manager':
        navigate('/technical-manager');
        break;
      case 'engineer':
        navigate('/engineer');
        break;
      case 'customer-officer':
        navigate('/customer-officer');
        break;
      default:
        navigate('/');
    }
  };

  const isAdmin = ['supervisor', 'technical-manager', 'engineer', 'customer-officer'].includes(user?.role || '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleGoBack}
                className="p-2 rounded-full hover:bg-red-700 transition-colors duration-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center space-x-3">
                  <Archive className="w-8 h-8" />
                  <span>Deleted Requests Archive</span>
                </h1>
                <p className="text-red-100 opacity-90 mt-1">
                  {isAdmin 
                    ? 'View, filter, and restore deleted tire requests from all users'
                    : 'View and restore your deleted tire requests'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-blue-800">
              <h3 className="font-semibold text-sm">About Deleted Requests</h3>
              <p className="text-sm mt-1">
                When requests are deleted, they are moved to a secure backup storage instead of being permanently removed. 
                This ensures data safety and allows for recovery if needed. 
                {isAdmin && ' As an administrator, you can view and restore deleted requests from all users.'}
                {!isAdmin && ' You can view and restore your own deleted requests.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DeletedRequestsTable 
          userIdFilter={isAdmin ? undefined : user?.id}
          showRestoreButton={true}
          title={isAdmin ? "All Deleted Requests" : "Your Deleted Requests"}
        />
      </div>

      {/* Additional Help Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use This Page</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔍 Filtering & Search</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use the "Filters" button to show search options</li>
                <li>• Search by vehicle number, status, or requester name</li>
                <li>• Filter by date range to find specific time periods</li>
                <li>• Sort results by deletion date, submission date, or other criteria</li>
                <li>• Clear all filters to see all deleted requests</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔄 Restoring Requests</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click the restore icon (↺) to restore a deleted request</li>
                <li>• Confirm the restoration in the popup dialog</li>
                <li>• Restored requests will appear in the main dashboard</li>
                <li>• All associated images and data are preserved</li>
                <li>• The request will have its original ID and timestamps</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Notes</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  • Deleted requests are kept in backup storage for data recovery purposes
                  • Restoring a request moves it back to the active requests list
                  • All request data including images, comments, and approval history is preserved
                  • {isAdmin ? 'Only administrators can view deleted requests from all users' : 'You can only view your own deleted requests'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletedRequestsPage;