import { useState, useEffect, useRef } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import { UserCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Request } from "../types/request";

interface RequestsContextType {
  requests: Request[];
  fetchRequests: () => Promise<void>;
  updateRequestStatus: (
    id: string,
    status: string,
    notes: string,
    role: string,
    userId?: string
  ) => Promise<void>;
}

const TechnicalManagerDashboard = () => {
  const { requests, fetchRequests, updateRequestStatus } =
    useRequests() as RequestsContextType;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [notes, setNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"requests" | "reports">(
    "requests"
  );
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Wrap fetchRequests with loading state
  const fetchRequestsWithLoading = async () => {
    setIsLoading(true);
    try {
      await fetchRequests();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsWithLoading();
  }, []);

  const pendingRequests = requests.filter(
    (req) => req.status === "supervisor approved"
  );

  // Filter approved requests to only show those approved by the current technical manager
  const approvedRequests = requests.filter(
    (req) =>
      req.status === "technical-manager approved" &&
      req.technical_manager_id === user?.id
  );

  // Filter rejected requests to only show those rejected by the current technical manager
  const rejectedRequests = requests.filter(
    (req) =>
      req.status === "rejected" &&
      req.technical_manager_note &&
      req.technical_manager_note.trim() !== "" &&
      req.technical_manager_id === user?.id
  );

  const handleApprove = (requestId: string) => {
    setSelectedRequest(requests.find((r) => r.id === requestId) || null);
    setIsApproving(true);
    setShowNotesModal(true);
  };

  const handleReject = (requestId: string) => {
    setSelectedRequest(requests.find((r) => r.id === requestId) || null);
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
        isApproving ? "technical-manager approved" : "rejected",
        notes,
        "technical-manager",
        user?.id
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Gradient */}
      <header className="bg-gradient-to-r from-violet-600 to-purple-700 shadow-lg">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Technical Manager Dashboard</h1>
              <p className="text-violet-100 mt-1">Review technical specifications and approve requests</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{pendingRequests.length}</div>
                  <div className="text-xs text-violet-100">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{approvedRequests.length}</div>
                  <div className="text-xs text-violet-100">Approved</div>
                </div>
              </div>
              {/* User Avatar */}
              <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="flex space-x-1 bg-violet-500/20 p-1 rounded-lg backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("requests")}
              className={`${
                activeTab === "requests"
                  ? "bg-white text-violet-700 shadow-md"
                  : "text-violet-100 hover:text-white hover:bg-violet-500/30"
              } flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Technical Reviews</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`${
                activeTab === "reports"
                  ? "bg-white text-violet-700 shadow-md"
                  : "text-violet-100 hover:text-white hover:bg-violet-500/30"
              } flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Technical Analytics</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin" />
          </div>
        ) : activeTab === "requests" ? (
          <div className="space-y-6">
            {/* Pending Requests */}
            <RequestTable
              requests={pendingRequests}
              title="Pending Technical Review"
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={() => {}}
              onView={(request) =>
                navigate(`/technical-manager/request/${request.id}`)
              }
              onPlaceOrder={() => {}}
              showActions={false}
            />

            {/* Approved Requests */}
            <RequestTable
              requests={approvedRequests}
              title="Technically Approved Requests"
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={() => {}}
              onView={(request) =>
                navigate(`/technical-manager/request/${request.id}`)
              }
              onPlaceOrder={() => {}}
              showActions={false}
            />

            {/* Rejected Requests */}
            <RequestTable
              requests={rejectedRequests}
              title="Technically Rejected Requests"
              onApprove={handleApprove}
              onReject={handleReject}
              onView={(request) =>
                navigate(`/technical-manager/request/${request.id}`)
              }
              onDelete={() => {}}
              onPlaceOrder={() => {}}
              showActions={false}
            />
          </div>
        ) : (
          <RequestReports requests={requests} role="technical-manager" />
        )}
      </main>

      {/* Notes Modal */}
      {showNotesModal && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold">
              {isApproving ? "Technical Approval" : "Technical Rejection"} Notes
            </h3>
            <textarea
              className="w-full h-32 p-2 border rounded-md"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter technical review notes..."
            />
            <div className="flex justify-end mt-4 space-x-3">
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
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
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

export default TechnicalManagerDashboard;
