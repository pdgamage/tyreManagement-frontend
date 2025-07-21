import { useState, useEffect } from "react";
import { useRequests } from "../contexts/RequestContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import PlaceOrderModal from "../components/PlaceOrderModal";
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
  const { requests, fetchRequests, updateRequestStatus } = useRequests() as RequestsContextType;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"requests" | "reports">(
    "requests"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [orderRequest, setOrderRequest] = useState<Request | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchRequests();
      setIsLoading(false);
    };
    loadData();
  }, [fetchRequests]);

  // Filter requests to show both "complete" and "order placed" status
  const completeRequests = requests.filter((req) =>
    req.status === "complete" || req.status === "order placed"
  );

  // Filter cancelled orders
  const cancelledRequests = requests.filter((req) =>
    req.status === "order cancelled"
  );

  const handleView = (request: Request) => {
    navigate(`/customer-officer/request/${request.id}`);
  };

  const handlePlaceOrder = (request: Request) => {
    setOrderRequest(request);
    setShowPlaceOrderModal(true);
  };

  const handleOrderPlaced = async () => {
    // Refresh the requests list after order is placed
    await fetchRequests();
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests/${deleteId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh the requests list after deletion
        await fetchRequests();
      } else {
        console.error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }

    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleCancelOrder = async (id: string) => {
    setCancelId(id);
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    if (!cancelId || !cancelReason.trim()) return;

    try {
      await updateRequestStatus(
        cancelId,
        "order cancelled",
        cancelReason.trim(),
        "customer-officer"
      );

      // Refresh the requests list after cancellation
      await fetchRequests();
    } catch (error) {
      console.error("Error cancelling order:", error);
    }

    setShowCancelConfirm(false);
    setCancelId(null);
    setCancelReason("");
  };

  const cancelOrderCancel = () => {
    setShowCancelConfirm(false);
    setCancelId(null);
    setCancelReason("");
  };

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
                Orders
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
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin" />
          </div>
        ) : activeTab === "requests" ? (
          <div className="space-y-6">
            {/* Complete Requests */}
            <RequestTable
              requests={completeRequests}
              title={`Orders & Completed Requests (${completeRequests.length})`}
              onApprove={() => {}}
              onReject={() => {}}
              onView={handleView}
              onDelete={handleDelete}
              onPlaceOrder={handlePlaceOrder}
              onCancelOrder={handleCancelOrder}
              showActions={true}
              showPlaceOrderButton={true} // Enable place order button for customer officers
              showCancelButton={true} // Enable cancel button for customer officers
            />

            {/* Cancelled Orders */}
            {cancelledRequests.length > 0 && (
              <RequestTable
                requests={cancelledRequests}
                title={`Cancelled Orders (${cancelledRequests.length})`}
                onApprove={() => {}}
                onReject={() => {}}
                onView={handleView}
                onDelete={handleDelete}
                onPlaceOrder={() => {}}
                showActions={true}
                showPlaceOrderButton={false}
                showCancelButton={false}
              />
            )}
          </div>
        ) : (
          <RequestReports requests={[...completeRequests, ...cancelledRequests]} role="customer-officer" />
        )}
      </main>

      {/* Place Order Modal */}
      <PlaceOrderModal
        request={orderRequest}
        isOpen={showPlaceOrderModal}
        onClose={() => setShowPlaceOrderModal(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-red-700">
              Confirm Deletion
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this request? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-orange-700">
              Cancel Order
            </h3>
            <p className="mb-4 text-gray-600">
              Please provide a reason for cancelling this order:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={4}
              required
            />
            <p className="mb-6 text-sm text-gray-500">
              This action will update the order status to "order cancelled".
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                onClick={cancelOrderCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-orange-600 rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={confirmCancelOrder}
                disabled={!cancelReason.trim()}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOfficerDashboard;
