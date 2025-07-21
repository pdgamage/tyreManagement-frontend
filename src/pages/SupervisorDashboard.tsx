import { useState, useEffect, useRef } from "react";
import { useRequests } from "../contexts/RequestContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import { Request } from "../types/request";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"requests" | "reports">(
    "requests"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      req.status === "rejected" &&
      req.supervisor_notes &&
      req.supervisor_notes.trim() !== "" &&
      req.supervisor_decision_by === user?.id &&
      // Ensure this was actually rejected by supervisor, not by technical manager or engineer
      (!req.technical_manager_note ||
        req.technical_manager_note.trim() === "") &&
      (!req.engineer_note || req.engineer_note.trim() === "")
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Gradient */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-700 shadow-lg">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Supervisor Dashboard</h1>
              <p className="text-amber-100 mt-1">Review and approve tire requests</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{pendingRequests.length}</div>
                  <div className="text-xs text-amber-100">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{approvedRequests.length}</div>
                  <div className="text-xs text-amber-100">Approved</div>
                </div>
              </div>
              {/* User Avatar */}
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="flex space-x-1 bg-amber-500/20 p-1 rounded-lg backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("requests")}
              className={`${
                activeTab === "requests"
                  ? "bg-white text-amber-700 shadow-md"
                  : "text-amber-100 hover:text-white hover:bg-amber-500/30"
              } flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Request Management</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`${
                activeTab === "reports"
                  ? "bg-white text-amber-700 shadow-md"
                  : "text-amber-100 hover:text-white hover:bg-amber-500/30"
              } flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Reports & Analytics</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content with modern spacing */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-4">
        {activeTab === "requests" ? (
          <div className="space-y-8">
            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Pending Review</p>
                    <p className="text-3xl font-bold">{pendingRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-400/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Approved</p>
                    <p className="text-3xl font-bold">{approvedRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-400/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Rejected</p>
                    <p className="text-3xl font-bold">{rejectedRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-400/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Requests Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Pending Requests</h2>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                    {pendingRequests.length} pending
                  </span>
                </div>
              </div>
              <div className="p-0">
                <RequestTable
                  requests={pendingRequests}
                  title=""
                  onApprove={() => {}}
                  onReject={() => {}}
                  onView={(request) =>
                    navigate(`/supervisor/request/${Number(request.id)}`)
                  }
                  onDelete={() => {}}
                  onPlaceOrder={() => {}}
                  showActions={false}
                  showPlaceOrderButton={false}
                />
              </div>
            </div>

            {/* Approved Requests Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Approved Requests</h2>
                  </div>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
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
                    navigate(`/supervisor/request/${Number(request.id)}`)
                  }
                  onDelete={() => {}}
                  onPlaceOrder={() => {}}
                  showActions={false}
                  showPlaceOrderButton={false}
                />
              </div>
            </div>

            {/* Rejected Requests Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Rejected Requests</h2>
                  </div>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
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
                    navigate(`/supervisor/request/${Number(request.id)}`)
                  }
                  onDelete={() => {}}
                  onPlaceOrder={() => {}}
                  showActions={false}
                  showPlaceOrderButton={false}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
              </div>
            </div>
            <div className="p-6">
              <RequestReports requests={supervisorRequests} role="supervisor" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SupervisorDashboard;
