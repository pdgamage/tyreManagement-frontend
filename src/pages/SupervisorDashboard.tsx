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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab("requests")}
                className={`${
                  activeTab === "requests"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
              >
                Requests
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`${
                  activeTab === "reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
              >
                Reports & Analytics
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {activeTab === "requests" ? (
          <div className="space-y-6">
            {/* Pending Requests */}
            <RequestTable
              requests={pendingRequests}
              title="Pending Requests"
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

            {/* Approved Requests */}
            <RequestTable
              requests={approvedRequests}
              title="Approved Requests"
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

            {/* Rejected Requests */}
            <RequestTable
              requests={rejectedRequests}
              title="Rejected Requests"
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
        ) : (
          <RequestReports requests={supervisorRequests} role="supervisor" />
        )}
      </main>
    </div>
  );
};

export default SupervisorDashboard;
