import { useState, useEffect, useRef } from "react";
import { useRequests } from "../contexts/RequestContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import { UserCircle, ChevronDown, LogOut, ClipboardList, BarChart3 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Request } from "../types/request";

const EngineerDashboard = () => {
  const { requests, fetchRequests } = useRequests();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"requests" | "analytics">("requests");
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
    (req) => req.status === "complete"
  );

  // Get requests rejected by current engineer
  const rejectedRequests = requests.filter(
    (req) =>
      req.status === "rejected" &&
      req.engineer_note &&
      req.engineer_note.trim() !== ""
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
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Gradient */}
      <header className="bg-gradient-to-r from-cyan-600 to-blue-700 shadow-lg">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Engineer Dashboard</h1>
              <p className="text-cyan-100 mt-1">Complete technical assessments and tire installations</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                >
                  <UserCircle className="w-6 h-6" />
                  <span>{user?.name || "Profile"}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              {/* User Avatar */}
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-4">

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("requests")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "requests"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <ClipboardList className="inline w-5 h-5 mr-2" />
            Engineering Requests
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <BarChart3 className="inline w-5 h-5 mr-2" />
            Reports & Analytics
          </button>
        </nav>
      </div>

      {/* Main Content */}
      {activeTab === "requests" ? (
        <div className="space-y-8">
          {/* Pending Requests Table */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Pending Engineering Review ({pendingRequests.length})
            </h2>
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
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Completed Requests ({completedRequests.length})
            </h2>
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
            <h2 className="mb-4 text-xl font-semibold">
              Engineering Rejected Requests ({rejectedRequests.length})
            </h2>
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
      ) : (
        <RequestReports requests={requests} role="engineer" />
      )}
    </div>
  );
};

export default EngineerDashboard;
