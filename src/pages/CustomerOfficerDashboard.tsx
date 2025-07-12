import { useState, useEffect } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import { UserCircle } from "lucide-react";
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

const CustomerOfficerDashboard = () => {
  const { requests, fetchRequests } = useRequests() as RequestsContextType;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"requests" | "reports">(
    "requests"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchRequests();
      setIsLoading(false);
    };
    loadData();
  }, [fetchRequests]);

  // Filter requests to only show those with status "complete"
  const completeRequests = requests.filter((req) => req.status === "complete");

  const handleView = (request: Request) => {
    navigate(`/customer-officer/request/${request.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Navigation Tabs */}
            <div className="flex space-x-6">
              <button
                onClick={() => navigate("/customer-officer")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "requests"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "requests"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "reports"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => navigate("/customer-officer/stock")}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-blue-50 transition-colors"
              >
                Stock Management
              </button>
            </div>

            {/* User Profile Section */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.name}</span>
              <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                Customer Officer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin" />
          </div>
        ) : activeTab === "requests" ? (
          <div className="space-y-6">
            {/* Complete Requests */}
            <RequestTable
              requests={completeRequests}
              title={`Completed Requests (${completeRequests.length})`}
              onApprove={() => {}}
              onReject={() => {}}
              onView={handleView}
              onDelete={() => {}}
              onPlaceOrder={() => {}}
              showActions={false}
            />
          </div>
        ) : (
          <RequestReports requests={completeRequests} role="customer-officer" />
        )}
      </main>
    </div>
  );
};

export default CustomerOfficerDashboard;
