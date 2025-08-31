import { useState, useEffect, useRef } from "react";
import { useRequests } from "../contexts/RequestContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import { UserCircle, ChevronDown, LogOut, ClipboardList, BarChart3, Clock, CheckCircle2, XCircle, Wrench } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiUrls } from "../config/api";
import type { Request } from "../types/request";

const EngineerDashboard = () => {
  const { requests, fetchRequests } = useRequests();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"requests" | "analytics">("requests");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
  // Get requests that need engineer review (technical manager approved)
  const pendingRequests = requests.filter(
    (req) => req.status === "technical-manager approved"
  );

  // Get requests completed by current engineer
  const completedRequests = requests.filter(
    (req) => req.status === "complete" || req.status === "Engineer Approved"
  );

  // Get requests rejected by current engineer
  const rejectedRequests = requests.filter(
    (req) => req.status === "engineer rejected"
  );

  // Calculate total displayed requests
  const totalDisplayedRequests = pendingRequests.length + completedRequests.length + rejectedRequests.length;

  const handleApprove = (requestId: string) => {
    // Navigate to detail page for approval
    navigate(`/engineer/request/${requestId}`);
  };

  const handleReject = (requestId: string) => {
    // Navigate to detail page for rejection
    navigate(`/engineer/request/${requestId}`);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      console.log('🗑️  [Engineer] Deleting request ID:', deleteId);
      
      const response = await fetch(apiUrls.requestById(deleteId), {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || null, // Send engineer user ID for audit trail
          userRole: user?.role || null // Send engineer role for audit trail
        })
      });

      console.log('[Engineer] Delete response status:', response.status);
      const responseData = await response.json();
      console.log('[Engineer] Delete response data:', responseData);

      if (response.ok) {
        console.log('✅ [Engineer] Delete successful, refreshing requests...');
        // Refresh the requests list after deletion
        await fetchRequests();
      } else {
        console.error('❌ [Engineer] Failed to delete request:', responseData);
      }
    } catch (error) {
      console.error("❌ [Engineer] Error deleting request:", error);
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
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Enhanced Header Title Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Engineer Dashboard
                </h1>
                <p className="text-slate-300 text-lg font-medium mt-1">
                  Complete technical implementations and manage engineering tasks
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400 font-medium">Engineering Level Access</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-sm text-slate-400">Welcome back, {user?.name || 'Engineer'}</span>
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
                  <div className="text-sm font-medium text-white">{user?.name || 'Engineer'}</div>
                  <div className="text-xs text-slate-300">Engineer</div>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20 hover:shadow-xl transition-all duration-200"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Engineering Tasks</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
                {pendingRequests.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`${
                activeTab === "analytics"
                  ? "bg-white text-slate-700 shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/20"
              } flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Engineering Analytics</span>
            </button>
            <button
              onClick={() => navigate("/engineer/inquiry-dashboard")}
              className="text-slate-300 hover:text-white hover:bg-white/20 flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Engineer Inquiry</span>
            </button>
            <button
              onClick={() => navigate("/engineer/deleted-requests")}
              className="text-slate-300 hover:text-white hover:bg-white/20 flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <Clock className="w-6 h-6" />
              <span>Deleted Requests</span>
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
                    <p className="text-amber-100 text-sm font-medium mb-2">Pending Tasks</p>
                    <p className="text-4xl font-bold mb-1">{pendingRequests.length}</p>
                    <p className="text-amber-200 text-xs">Awaiting implementation</p>
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
                    <p className="text-emerald-100 text-sm font-medium mb-2">Completed</p>
                    <p className="text-4xl font-bold mb-1">{completedRequests.length}</p>
                    <p className="text-emerald-200 text-xs">Successfully implemented</p>
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
                    <p className="text-red-200 text-xs">Implementation issues</p>
                  </div>
                  <div className="w-16 h-16 bg-red-400/30 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-2">Total Tasks</p>
                    <p className="text-4xl font-bold mb-1">{totalDisplayedRequests}</p>
                    <p className="text-purple-200 text-xs">All engineering tasks</p>
                  </div>
                  <div className="w-16 h-16 bg-purple-400/30 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Enhanced Request Tables */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-6 border-b border-amber-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-amber-900">Pending Engineering Tasks</h2>
                      <p className="text-amber-700 text-sm">Requests ready for implementation</p>
                    </div>
                  </div>
                </div>
                <div className="p-0">
                  <RequestTable
                    requests={pendingRequests}
                    title=""
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onView={(request) => navigate(`/engineer/request/${request.id}`)}
                    onDelete={handleDelete}
                    onPlaceOrder={() => {}}
                    showActions={true}
                    showDeleteButton={true}
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
                      <h2 className="text-xl font-bold text-emerald-900">Completed Engineering Tasks</h2>
                      <p className="text-emerald-700 text-sm">Successfully implemented requests</p>
                    </div>
                  </div>
                </div>
                <div className="p-0">
                  <RequestTable
                    requests={completedRequests}
                    title=""
                    onApprove={() => {}}
                    onReject={() => {}}
                    onView={(request) => navigate(`/engineer/request/${request.id}`)}
                    onDelete={handleDelete}
                    onPlaceOrder={() => {}}
                    showActions={true}
                    showDeleteButton={true}
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
                      <h2 className="text-xl font-bold text-red-900">Engineering Rejected Tasks</h2>
                      <p className="text-red-700 text-sm">Tasks with implementation issues</p>
                    </div>
                  </div>
                </div>
                <div className="p-0">
                  <RequestTable
                    requests={rejectedRequests}
                    title=""
                    onApprove={() => {}}
                    onReject={() => {}}
                    onView={(request) => navigate(`/engineer/request/${request.id}`)}
                    onDelete={handleDelete}
                    onPlaceOrder={() => {}}
                    showActions={true}
                    showDeleteButton={true}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-6 border-b border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-purple-900">Engineering Analytics & Reports</h2>
                  <p className="text-purple-700 text-sm">Comprehensive engineering performance insights</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <RequestReports requests={requests} role="engineer" />
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={cancelDelete}
        >
          <div
            className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-500">
                  Request will be moved to backup storage
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this request? The request will be moved to backup storage and can be restored if needed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
                onClick={confirmDelete}
              >
                <XCircle className="w-4 h-4" />
                <span>Archive Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerDashboard;
