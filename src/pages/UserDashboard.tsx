import { useState, useEffect } from "react";
import TireRequestForm from "../components/TireRequestForm";
import RequestDetailsModal from "../components/RequestDetailsModal";
import RequestTable from "../components/RequestTable";
import { TireRequest } from "../types/api";
import { useAuth } from "../contexts/AuthContext";
import { useRequests } from "../contexts/RequestContext";

const UserDashboard = () => {
  const { user } = useAuth();
  const { requests, fetchRequests } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<TireRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter user's own requests
  const userRequests = requests.filter(req => req.userId === user?.id);

  const closeDetailsModal = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">User Dashboard</h1>
        <div className="space-x-3">
          <button
            onClick={() => (window.location.href = "/vehicle-registration")}
            className="px-4 py-2 text-white transition-colors bg-green-600 rounded hover:bg-green-700"
          >
            Register Vehicle
          </button>
        </div>
      </div>

      {/* Tire Request Form Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Submit New Tire Request
          </h2>
        </div>
        <div className="p-6">
          <TireRequestForm onSuccess={() => {
            fetchRequests(); // Refresh requests after successful submission
          }} />
        </div>
      </div>

      {/* Your Tire Requests Section with Color-Coded Statuses */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Your Tire Requests
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track the status of your tire requests with color-coded indicators
          </p>
        </div>
        <div className="p-6">
          {userRequests.length > 0 ? (
            <RequestTable
              requests={userRequests}
              onRequestSelect={setSelectedRequest}
              role="user"
            />
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No requests found</div>
              <p className="text-gray-500 text-sm">
                Submit your first tire request using the form above
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={closeDetailsModal}
          isOpen={!!selectedRequest}
        />
      )}
    </div>
  );
};

export default UserDashboard;
