import { useState, useEffect, useRef } from 'react';
import { useRequests } from '../contexts/RequestContext';
import RequestTable from '../components/RequestTable';
import { UserCircle, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Request } from '../types/request';

const EngineerDashboard = () => {
  const { requests, updateRequestStatus, fetchRequests } = useRequests();
  const { user, logout } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedRequestData, setSelectedRequestData] = useState<Request | null>(null);
  const [notes, setNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
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
    req.comments?.includes('Engineer:')
  );  const handleApprove = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(requestId);
      setSelectedRequestData(request);
      setIsApproving(true);
      setShowNotesModal(true);
    }
  };

  const handleReject = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(requestId);
      setSelectedRequestData(request as unknown as Request);
      setIsApproving(false);
      setShowNotesModal(true);
    }
  };
  const handleNotesSubmit = async () => {
    if (!selectedRequest || !notes.trim()) {
      alert('Please add notes');
      return;
    }
    
    try {
      // First mark as engineer approved/rejected
      await updateRequestStatus(
        selectedRequest,
        isApproving ? 'engineer approved' : 'rejected',
        `Engineer: ${notes}`
      );

      // If approved, move to complete status
      if (isApproving) {
        await updateRequestStatus(
          selectedRequest,
          'complete',
          'Auto-completed after engineer approval'
        );
      }

      setShowNotesModal(false);
      setSelectedRequest(null);
      setSelectedRequestData(null);
      setNotes('');
      await fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to update request status:', error);
      alert('Failed to update request status');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Engineer Dashboard
        </h1>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <UserCircle className="h-8 w-8 text-gray-600" />
            <span className="font-medium text-gray-700">
              {user?.name || 'Profile'}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
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
          <h2 className="text-xl font-semibold mb-4">Pending Engineering Review ({pendingRequests.length})</h2>
          <RequestTable 
            requests={pendingRequests}
            title="Pending Requests"
            onApprove={handleApprove}
            onReject={handleReject}
            onView={(request) => {}}
          />
        </div>

        {/* Approved Requests Table */}
        <div>          <h2 className="text-xl font-semibold mb-4">Completed Requests ({completedRequests.length})</h2>
          <RequestTable 
            requests={completedRequests}
            title="Completed Requests"
            onApprove={handleApprove}
            onReject={handleReject}
            onView={(request) => setSelectedRequest(request)}
            showActions={false}
          />
        </div>

        {/* Rejected Requests Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Engineering Rejected Requests ({rejectedRequests.length})</h2>
          <RequestTable 
            requests={rejectedRequests}
            title="Rejected Requests"
            onApprove={handleApprove}
            onReject={handleReject}
            onView={(request) => {}}
            showActions={false}
          />
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {isApproving ? 'Approve Request' : 'Reject Request'}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 p-2 border rounded"
              placeholder="Add your notes..."
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedRequest(null);
                  setNotes('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleNotesSubmit}
                className={`px-4 py-2 text-white rounded ${
                  isApproving ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isApproving ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerDashboard;
