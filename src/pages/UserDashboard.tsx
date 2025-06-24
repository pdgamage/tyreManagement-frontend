import { useState } from "react";
import TireRequestForm from "../components/TireRequestForm";
import RequestDetailsModal from "../components/RequestDetailsModal";
import { TireRequest } from "../types/api";

const UserDashboard = () => {
  const [selectedRequest, setSelectedRequest] = useState<TireRequest | null>(null);

  const closeDetailsModal = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Dashboard</h1>
        <div className="space-x-3">
          <button
            onClick={() => window.location.href = '/vehicle-registration'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Register Vehicle
          </button>
        </div>
      </div>

      {/* Tire Request Form Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Submit New Tire Request</h2>
        </div>
        <div className="p-6">
          <TireRequestForm
            onSuccess={() => {
              // Handle success if needed
            }}
          />
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
