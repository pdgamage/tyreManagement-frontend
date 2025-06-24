import { useState, useEffect, useRef } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import { UserCircle, ChevronDown } from "lucide-react";
import { Request } from "../types/request";

interface RequestsContextType {
  requests: Request[];
  fetchRequests: () => void;
  updateRequestStatus: (id: string, status: string, notes: string) => void;
}

interface AuthContextType {
  user: { name: string; email: string } | null;
  logout: () => void;
}

const SupervisorDashboard = () => {
  const { requests, fetchRequests, updateRequestStatus } = useRequests() as RequestsContextType;
  const { logout } = useAuth() as AuthContextType;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [notes, setNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'reports'>('requests');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const pendingRequests = requests.filter(
    (req) => req.status === "pending"
  );
  const approvedRequests = requests.filter(
    (req) => req.status === "supervisor approved"
  );
  const rejectedRequests = requests.filter(
    (req) => req.status === "rejected"
  );

  const handleApprove = (requestId: string) => {
    setSelectedRequest(requests.find(r => r.id === requestId) || null);
    setIsApproving(true);
    setShowNotesModal(true);
  };

  const handleReject = (requestId: string) => {
    setSelectedRequest(requests.find(r => r.id === requestId) || null);
    setIsApproving(false);
    setShowNotesModal(true);
  };

  const handleNotesSubmit = async () => {
    if (!selectedRequest || !notes.trim()) {
      alert("Please add notes");
      return;
    }
    
    try {
      await updateRequestStatus(
        selectedRequest.id,
        isApproving ? "supervisor approved" : "rejected",
        notes
      );
      setShowNotesModal(false);
      setSelectedRequest(null);
      setNotes("");
      fetchRequests();
    } catch (error) {
      alert("Failed to update request status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Supervisor Dashboard</h1>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <UserCircle className="h-8 w-8 text-gray-600" />
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <button
                    onClick={() => logout()}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('requests')}
                className={`${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
              >
                Requests
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
              >
                Reports & Analytics
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'requests' ? (
          <div className="space-y-6">
            {/* Pending Requests */}
            <RequestTable
              requests={pendingRequests}
              title="Pending Requests"
              onApprove={handleApprove}
              onReject={handleReject}
              onView={(request) => setSelectedRequest(request)}
            />

            {/* Approved Requests */}
            <RequestTable
              requests={approvedRequests}
              title="Approved Requests"
              onApprove={handleApprove}
              onReject={handleReject}
              onView={(request) => setSelectedRequest(request)}
              showActions={false}
            />

            {/* Rejected Requests */}
            <RequestTable
              requests={rejectedRequests}
              title="Rejected Requests"
              onApprove={handleApprove}
              onReject={handleReject}
              onView={(request) => setSelectedRequest(request)}
              showActions={false}
            />
          </div>
        ) : (
          <RequestReports requests={requests} role="supervisor" />
        )}
      </main>

      {/* Notes Modal */}
      {showNotesModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {isApproving ? "Approval" : "Rejection"} Notes
            </h3>
            <textarea
              className="w-full h-32 p-2 border rounded-md"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your notes..."
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedRequest(null);
                  setNotes("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleNotesSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
