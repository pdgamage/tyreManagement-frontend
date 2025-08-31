import { useState, useEffect, useRef } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import { UserCircle, ChevronDown, Clock, CheckCircle2, XCircle, BarChart3, Settings } from "lucide-react";
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

  // Filter approved requests to show all technically approved requests
  const approvedRequests = requests.filter(
    (req) => req.status === "technical-manager approved"
  );

  // Filter rejected requests to only show those rejected by the current technical manager
  const rejectedRequests = requests.filter(
    (req) =>
      req.status === "technical-manager rejected" &&
      req.technical_manager_note &&
      req.technical_manager_note.trim() !== "" &&
      req.technical_manager_id === user?.id
  );

  // Calculate total displayed requests
  const totalDisplayedRequests = pendingRequests.length + approvedRequests.length + rejectedRequests.length;

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
        isApproving ? "technical-manager approved" : "technical-manager rejected",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header with Enhanced Design */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Enhanced Header Title Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Technical Manager Dashboard
                </h1>
                <p className="text-slate-300 text-lg font-medium mt-1">
                  Review, approve, and manage technical specifications efficiently
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400 font-medium">Technical Manager Level Access</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-sm text-slate-400">Welcome back, {user?.name || 'Technical Manager'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Quick Actions */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <div className="text-xs text-slate-300 font-medium">Current Time</div>
                  <div className="text-sm font-semibold text-white">{new Date().toLocaleTimeString()}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <div className="text-xs text-slate-300 font-medium">Today's Date</div>
                  <div className="text-sm font-semibold text-white">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
              {/* Enhanced User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">{user?.name || 'Technical Manager'}</div>
                  <div className="text-xs text-slate-300">Technical Manager</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Tab Navigation */}
          <div className="flex space-x-2 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
            <button
              onClick={() => setActiveTab("requests")}
              className={`${
                activeTab === "requests"
                  ? "bg-white text-slate-700 shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/20"
              } flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Technical Manager Reviews</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                {pendingRequests.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`${
                activeTab === "reports"
                  ? "bg-white text-slate-700 shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/20"
              } flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Technical Manager Analytics</span>
            </button>
            <button
              onClick={() => navigate("/technical-manager/inquiry-dashboard")}
              className="text-slate-300 hover:text-white hover:bg-white/20 flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Technicle Manager Inquiry</span>
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-6">
        {activeTab === "requests" ? (
          <div className="space-y-8">
            {/* Professional Overview Cards with Enhanced Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl border border-amber-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium mb-2">User Requested tire Review</p>
                    <p className="text-4xl font-bold mb-1">{pendingRequests.length}</p>
                    <p className="text-amber-200 text-xs">Awaiting technical Manager approval</p>
                  </div>
                  <div className="w-16 h-16 bg-amber-400/30 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-xl border border-emerald-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-2">Approved</p>
                    <p className="text-4xl font-bold mb-1">{approvedRequests.length}</p>
                    <p className="text-emerald-200 text-xs">Technical Manager approved</p>
                  </div>
                  <div className="w-16 h-16 bg-emerald-400/30 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl border border-red-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-2">Rejected</p>
                    <p className="text-4xl font-bold mb-1">{rejectedRequests.length}</p>
                    <p className="text-red-200 text-xs">Technical issues found</p>
                  </div>
                  <div className="w-16 h-16 bg-red-400/30 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-2">Total Requests</p>
                    <p className="text-4xl font-bold mb-1">{totalDisplayedRequests}</p>
                    <p className="text-blue-200 text-xs">All requests displayed</p>
                  </div>
                  <div className="w-16 h-16 bg-blue-400/30 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Enhanced Request Tables */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-6 border-b border-amber-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-amber-900">User Requested tire Technical Manager Review</h2>
                        <p className="text-amber-700 text-sm">Requests awaiting your technical Manager approval</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-0">
                    <RequestTable
                      requests={pendingRequests}
                      title=""
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onDelete={() => {}}
                      onView={(request) =>
                        navigate(`/technical-manager/request/${request.id}`)
                      }
                      onPlaceOrder={() => {}}
                      showActions={true}
                      showDeleteButton={false}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-8 py-6 border-b border-emerald-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-emerald-900">Technical Manager Approved Requests</h2>
                        <p className="text-emerald-700 text-sm">Requests you have approved for technical specifications</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-0">
                    <RequestTable
                      requests={approvedRequests}
                      title=""
                      onApprove={() => {}}
                      onReject={() => {}}
                      onDelete={() => {}}
                      onView={(request) =>
                        navigate(`/technical-manager/request/${request.id}`)
                      }
                      onPlaceOrder={() => {}}
                      showActions={true}
                      showDeleteButton={false}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 px-8 py-6 border-b border-red-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-red-900">Technical Manager Rejected Requests</h2>
                        <p className="text-red-700 text-sm">Requests rejected due to technical issues</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-0">
                    <RequestTable
                      requests={rejectedRequests}
                      title=""
                      onApprove={() => {}}
                      onReject={() => {}}
                      onView={(request) =>
                        navigate(`/technical-manager/request/${request.id}`)
                      }
                      onDelete={() => {}}
                      onPlaceOrder={() => {}}
                      showActions={true}
                      showDeleteButton={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Technical Manager Analytics & Reports</h2>
                  <p className="text-blue-700 text-sm">Comprehensive technical performance insights</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <RequestReports requests={requests} role="technical-manager" />
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Notes Modal */}
      {showNotesModal && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className={`${isApproving ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-pink-600'} px-8 py-6`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  {isApproving ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <XCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isApproving ? "Technical Approval" : "Technical Rejection"}
                  </h3>
                  <p className="text-white/80 text-sm">
                    Request ID: {selectedRequest.id}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Technical Manager Review Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter detailed technical review notes..."
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                    setSelectedRequest(null);
                    setNotes("");
                  }}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNotesSubmit}
                  className={`px-6 py-3 text-white font-medium rounded-xl transition-all duration-200 ${
                    isApproving
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-200'
                      : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-200'
                  }`}
                >
                  {isApproving ? "Approve Request" : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalManagerDashboard;
