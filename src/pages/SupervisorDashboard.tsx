import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRequests } from "../contexts/RequestContext";
import RequestTable from "../components/RequestTable";
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
    (req) => req.supervisorId === user?.id
  );

  const pendingRequests = supervisorRequests.filter(
    (req) => req.status === "pending"
  );

  const approvedRequests = supervisorRequests.filter(
    (req) =>
      req.status === "supervisor approved" &&
      req.supervisor_decision_by === user?.id
  );

  const rejectedRequests = supervisorRequests.filter(
    (req) =>
      req.status === "supervisor rejected" &&
      req.supervisor_notes &&
      req.supervisor_notes.trim() !== "" &&
      req.supervisor_decision_by === user?.id
  );

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
          userId: user?.id || null,
          userRole: user?.role || null
        })
      });

      if (response.ok) {
        await fetchRequests();
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
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200 relative">
        <div className="px-3 sm:px-4 py-4 sm:py-6 lg:py-8 mx-auto max-w-7xl">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
            {/* Logo and Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">Supervisor Dashboard</h1>
                <p className="text-slate-300 mt-1 sm:mt-2 text-base sm:text-lg">Review, approve, and manage tire requests efficiently</p>
                <div className="flex flex-wrap items-center mt-2 sm:mt-3 gap-2 sm:gap-4">
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Supervisor Level Access
                  </span>
                  <span className="text-slate-400 text-sm">Welcome back, {user?.name || 'Supervisor'}</span>
                </div>
              </div>
            </div>

            {/* Right Side Content */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
              {/* Profile Section */}
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

          {/* Navigation Tabs */}
          <div className="mt-6 sm:mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
              <button
                onClick={() => setActiveTab("requests")}
                className={activeTab === "requests" 
                  ? "bg-white text-slate-700 shadow-lg w-full py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                  : "text-slate-300 hover:text-white hover:bg-white/20 w-full py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"}
              >
                <span>Request Management</span>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("reports")}
                className={activeTab === "reports"
                  ? "bg-white text-slate-700 shadow-lg w-full py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                  : "text-slate-300 hover:text-white hover:bg-white/20 w-full py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"}
              >
                <span>Analytics & Reports</span>
              </button>

              <button
                onClick={() => navigate("/supervisor/inquiry-dashboard")}
                className="text-slate-300 hover:text-white hover:bg-white/20 w-full py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Inquiry Dashboard</span>
              </button>

              <button
                onClick={() => navigate("/supervisor/deleted-requests")}
                className="text-slate-300 hover:text-white hover:bg-white/20 w-full py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Deleted Requests</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-4 py-6 sm:py-10 mx-auto max-w-7xl">
        {activeTab === "requests" ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {/* ... your existing stats cards ... */}
            </div>

            {/* Tables Sections */}
            <div className="space-y-6 sm:space-y-8">
              {/* Pending Requests Table */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <RequestTable
                    requests={pendingRequests}
                    title=""
                    onApprove={() => {}}
                    onReject={() => {}}
                    onView={(request) => navigate(`/supervisor/request/${request.id}`)}
                    onDelete={handleDelete}
                    onPlaceOrder={() => {}}
                    showActions={true}
                    showDeleteButton={true}
                    showPlaceOrderButton={false}
                  />
                </div>
              </div>

              {/* Approved Requests Table */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <RequestTable
                    requests={approvedRequests}
                    title=""
                    onApprove={() => {}}
                    onReject={() => {}}
                    onView={(request) => navigate(`/supervisor/request/${request.id}`)}
                    onDelete={handleDelete}
                    onPlaceOrder={() => {}}
                    showActions={true}
                    showDeleteButton={true}
                    showPlaceOrderButton={false}
                  />
                </div>
              </div>

              {/* Rejected Requests Table */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <RequestTable
                    requests={rejectedRequests}
                    title=""
                    onApprove={() => {}}
                    onReject={() => {}}
                    onView={(request) => navigate(`/supervisor/request/${request.id}`)}
                    onDelete={handleDelete}
                    onPlaceOrder={() => {}}
                    showActions={true}
                    showDeleteButton={true}
                    showPlaceOrderButton={false}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
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