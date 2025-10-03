import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRequests } from "../contexts/RequestContext";
import RequestTable from "../components/                    <div className="mt-4 sm:mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-12">
            <button
              onClick={() => setActiveTab("requests")}
              className={`${
                activeTab === "requests"
                  ? "bg-white text-slate-700 shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/20"
              } w-full py-3 sm:py-4 px-4 sm:px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3`}able";
import RequestReports from "../components/RequestReports";
import { Request } from "../types/request";
import { useAuth } from "../contexts/AuthContext";
import { apiUrls } from "../config/api";
import { Clock, CheckCircle2, XCircle, BarChart3, LogOut } from "lucide-react";

interface RequestsContextType {
  requests: Request[];
  fetchRequests: () => void;
  updateRequestStatus: (
    id: string,
    status: string,
    notes: string,
    role: string
  ) => Promise<void>;
}

const SupervisorDashboard = () => {
  const { requests, fetchRequests } = useRequests() as RequestsContextType;
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"requests" | "reports">("requests");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter requests for this supervisor only
  const supervisorRequests = requests.filter(
    (req) => req.supervisorId === user?.id // <-- Only requests for this supervisor
  );

  const pendingRequests = supervisorRequests.filter(
    (req) => req.status === "pending"
  );

  // Show approved requests done by current supervisor
  const approvedRequests = supervisorRequests.filter(
    (req) =>
      req.status === "supervisor approved" &&
      req.supervisor_decision_by === user?.id
  );

  // Show rejected requests done by current supervisor only
  const rejectedRequests = supervisorRequests.filter(
    (req) =>
      req.status === "supervisor rejected" &&
      req.supervisor_notes &&
      req.supervisor_notes.trim() !== "" &&
      req.supervisor_decision_by === user?.id
  );

  // Calculate total displayed requests (only the ones shown in the dashboard)
  const totalDisplayedRequests = pendingRequests.length + approvedRequests.length + rejectedRequests.length;

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      console.log('🗑️  [Supervisor] Deleting request ID:', deleteId);
      
      const response = await fetch(apiUrls.requestById(deleteId), {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || null, // Send supervisor user ID for audit trail
          userRole: user?.role || null // Send supervisor role for audit trail
        })
      });

      console.log('[Supervisor] Delete response status:', response.status);
      const responseData = await response.json();
      console.log('[Supervisor] Delete response data:', responseData);

      if (response.ok) {
        console.log('✅ [Supervisor] Delete successful, refreshing requests...');
        // Refresh the requests list after deletion
        await fetchRequests();
      } else {
        console.error('❌ [Supervisor] Failed to delete request:', responseData);
      }
    } catch (error) {
      console.error("❌ [Supervisor] Error deleting request:", error);
    }

    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header with Enhanced Design */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200 relative">
        <div className="px-4 py-4 sm:py-6 lg:py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Enhanced Header Title Section */}
          <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">Supervisor Dashboard</h1>
                <p className="text-slate-300 mt-2 text-base sm:text-lg">Review, approve, and manage tire requests efficiently</p>
                <div className="flex items-center mt-3 space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Supervisor Level Access
                  </span>
                  <span className="text-slate-400 text-sm">Welcome back, {user?.name || 'Supervisor'}</span>
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
                  <div className="text-sm font-medium text-white">{user?.name || 'Supervisor'}</div>
                  <div className="text-xs text-slate-300">Supervisor</div>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20 hover:shadow-xl transition-all duration-200"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 w-48 py-1 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Tab Navigation */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
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
              <span>Request Management</span>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
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
              <span>Analytics & Reports</span>
            </button>
            <button
              onClick={() => navigate("/supervisor/inquiry-dashboard")}
              className="text-slate-300 hover:text-white hover:bg-white/20 flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Inquiry Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/supervisor/deleted-requests")}
              className="text-slate-300 hover:text-white hover:bg-white/20 flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <Clock className="w-6 h-6" />
              <span>Deleted Requests</span>
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="px-2 sm:px-4 py-6 sm:py-10 mx-auto max-w-7xl lg:px-8 -mt-4 sm:-mt-6 overflow-hidden">
        {activeTab === "requests" ? (
          <div className="space-y-8">
            {/* Professional Overview Cards with Enhanced Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl border border-amber-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium mb-2">User Requested Tire Review</p>
                    <p className="text-4xl font-bold mb-1">{pendingRequests.length}</p>
                    <p className="text-amber-200 text-xs">Requires immediate attention</p>
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
                    <p className="text-emerald-200 text-xs">Successfully processed</p>
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
                    <p className="text-red-200 text-xs">Declined requests</p>
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

            {/* User Requested Tire Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">User Requested Tire</h2>
                      <p className="text-gray-600 mt-1">Requests awaiting your approval</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full">
                      {pendingRequests.length} pending
                    </span>
                    {pendingRequests.length > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full animate-pulse">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-0">
                <RequestTable
                  requests={pendingRequests}
                  title=""
                  onApprove={() => {}}
                  onReject={() => {}}
                  onView={(request) =>
                    navigate(`/supervisor/request/${request.id}`)
                  }
                  onDelete={handleDelete}
                  onPlaceOrder={() => {}}
                  showActions={true}
                  showDeleteButton={true}
                  showPlaceOrderButton={false}
                />
              </div>
            </div>

            {/* Approved Requests Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Approved Requests</h2>
                      <p className="text-gray-600 mt-1">Successfully approved by you</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-2 rounded-full">
                    {approvedRequests.length} approved
                  </span>
                </div>
              </div>
              <div className="p-0">
                <RequestTable
                  requests={approvedRequests}
                  title=""
                  onApprove={() => {}}
                  onReject={() => {}}
                  onView={(request) =>
                    navigate(`/supervisor/request/${request.id}`)
                  }
                  onDelete={handleDelete}
                  onPlaceOrder={() => {}}
                  showActions={true}
                  showDeleteButton={true}
                  showPlaceOrderButton={false}
                />
              </div>
            </div>

            {/* Rejected Requests Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Rejected Requests</h2>
                      <p className="text-gray-600 mt-1">Requests declined with reasons</p>
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-full">
                    {rejectedRequests.length} rejected
                  </span>
                </div>
              </div>
              <div className="p-0">
                <RequestTable
                  requests={rejectedRequests}
                  title=""
                  onApprove={() => {}}
                  onReject={() => {}}
                  onView={(request) =>
                    navigate(`/supervisor/request/${request.id}`)
                  }
                  onDelete={handleDelete}
                  onPlaceOrder={() => {}}
                  showActions={true}
                  showDeleteButton={true}
                  showPlaceOrderButton={false}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                  <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <RequestReports requests={supervisorRequests} role="supervisor" />
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
                  <p className="text-white/80 text-sm">Supervisor Action Required</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this request? This action will move the request to the backup table and cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-200"
                >
                  Delete Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
