import { useState, useEffect, useRef } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import { UserCircle } from "lucide-react";
import { Request } from "../types/request";
import { useNavigate } from "react-router-dom";

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
  const { requests, fetchRequests } = useRequests() as RequestsContextType;
  const { logout } = useAuth() as AuthContextType;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"requests" | "reports">(
    "requests"
  );
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

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/requests/${id}`, {
        method: "DELETE",
      });
      await fetchRequests(); // Refresh the list after deletion
    } catch {
      alert("Failed to delete request");
    }
  };

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const approvedRequests = requests.filter(
    (req) => req.status === "supervisor approved"
  );
  const rejectedRequests = requests.filter((req) => req.status === "rejected");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Supervisor Dashboard
            </h1>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <UserCircle className="w-8 h-8 text-gray-600" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 w-48 py-1 mt-2 bg-white rounded-md shadow-lg">
                  <button
                    onClick={() => logout()}
                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

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
              showActions={true}
              onDelete={handleDelete}
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
              showActions={true}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <RequestReports requests={requests} role="supervisor" />
        )}
      </main>
    </div>
  );
};

export default SupervisorDashboard;
