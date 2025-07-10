import { useState, useEffect, useRef } from 'react';
import { useRequests } from '../contexts/RequestContext';
import RequestTable from '../components/RequestTable';
import { UserCircle, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Request } from '../types/request';

const EngineerDashboard = () => {
  const { requests, fetchRequests } = useRequests();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
  // Get requests that need engineer review (technical manager approved)
  const pendingRequests = requests.filter(req => req.status === 'technical-manager approved');
  // Get requests that are completed
  const completedRequests = requests.filter(req => req.status === 'complete');
  // Get requests rejected by engineer
  const rejectedRequests = requests.filter(req =>
    req.status === 'rejected' &&
    req.engineer_note
  );

  const handleApprove = (requestId: string) => {
    // Navigate to detail page for approval
    navigate(`/engineer/request/${requestId}`);
  };

  const handleReject = (requestId: string) => {
    // Navigate to detail page for rejection
    navigate(`/engineer/request/${requestId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-6xl p-4 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Engineer Dashboard
        </h1>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <UserCircle className="w-8 h-8 text-gray-600" />
            <span className="font-medium text-gray-700">
              {user?.name || 'Profile'}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 w-48 py-1 mt-2 bg-white rounded-lg shadow-lg">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Display approval tables */}
      <div className="space-y-8">
        {/* Pending Requests Table */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Pending Engineering Review ({pendingRequests.length})</h2>
          <RequestTable
            requests={pendingRequests}
            title="Pending Requests"
            onApprove={handleApprove}
            onReject={handleReject}
            onView={(request) => navigate(`/engineer/request/${request.id}`)}
            onDelete={() => {}}
            onPlaceOrder={() => {}}
            showActions={false}
          />
        </div>

        {/* Approved Requests Table */}
        <div>          <h2 className="mb-4 text-xl font-semibold">Completed Requests ({completedRequests.length})</h2>
          <RequestTable
            requests={completedRequests}
            title="Completed Requests"
            onApprove={handleApprove}
            onReject={handleReject}
            onView={(request) => navigate(`/engineer/request/${request.id}`)}
            onDelete={() => {}}
            onPlaceOrder={() => {}}
            showActions={false}
          />
        </div>

        {/* Rejected Requests Table */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Engineering Rejected Requests ({rejectedRequests.length})</h2>
          <RequestTable
            requests={rejectedRequests}
            title="Rejected Requests"
            onApprove={handleApprove}
            onReject={handleReject}
            onView={(request) => navigate(`/engineer/request/${request.id}`)}
            onDelete={() => {}}
            onPlaceOrder={() => {}}
            showActions={false}
          />
        </div>
      </div>


    </div>
  );
};

export default EngineerDashboard;
