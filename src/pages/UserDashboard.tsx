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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">User Dashboard</h1>
        <div className="space-x-3">
          <button
            onClick={() => window.location.href = '/vehicle-registration'}
            className="px-4 py-2 text-white transition-colors bg-green-600 rounded hover:bg-green-700"
          >
            Register Vehicle
          </button>
        </div>
      </div>

      {/* Tire Request Form Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Submit New Tire Request</h2>
        </div>
        <div className="p-6">
          <TireRequestForm
            onSuccess={() => {
              
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
