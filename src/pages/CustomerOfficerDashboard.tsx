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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Gradient */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Customer Officer Dashboard</h1>
              <p className="text-blue-100 mt-1">Manage orders and track analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{completeRequests.length}</div>
                  <div className="text-xs text-blue-100">Active Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{cancelledRequests.length}</div>
                  <div className="text-xs text-blue-100">Cancelled</div>
                </div>
              </div>
              {/* User Avatar */}
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="flex space-x-1 bg-blue-500/20 p-1 rounded-lg backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("requests")}
              className={`${
                activeTab === "requests"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-blue-100 hover:text-white hover:bg-blue-500/30"
              } flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Orders Management</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`${
                activeTab === "reports"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-blue-100 hover:text-white hover:bg-blue-500/30"
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        ) : activeTab === "requests" ? (
          <div className="space-y-8">
            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Orders</p>
                    <p className="text-3xl font-bold">{completeRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-400/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Cancelled Orders</p>
                    <p className="text-3xl font-bold">{cancelledRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-400/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold">{completeRequests.length + cancelledRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-400/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Orders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Active Orders & Completed Requests</h2>
                  </div>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    {completeRequests.length} orders
                  </span>
                </div>
              </div>
              <div className="p-0">
                <RequestTable
                  requests={completeRequests}
                  title=""
                  onApprove={() => {}}
                  onReject={() => {}}
                  onView={handleView}
                  onDelete={handleDelete}
                  onPlaceOrder={handlePlaceOrder}
                  onCancelOrder={handleCancelOrder}
                  showActions={true}
                  showPlaceOrderButton={true}
                  showCancelButton={true}
                />
              </div>
            </div>

            {/* Cancelled Orders Section */}
            {cancelledRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Cancelled Orders</h2>
                    </div>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                      {cancelledRequests.length} cancelled
                    </span>
                  </div>
                </div>
                <div className="p-0">
                  <RequestTable
                    requests={cancelledRequests}
                    title=""
                    onApprove={() => {}}
                    onReject={() => {}}
                    onView={handleView}
                    onDelete={handleDelete}
                    onPlaceOrder={() => {}}
                    showActions={true}
                    showPlaceOrderButton={false}
                    showCancelButton={false}
                  />
                </div>
              </div>
            )}
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
              <RequestReports requests={[...completeRequests, ...cancelledRequests]} role="customer-officer" />
            </div>
          </div>
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

      {/* Modern Cancel Order Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Cancel Order</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="mb-4 text-gray-600 leading-relaxed">
                Please provide a detailed reason for cancelling this order:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                rows={4}
                required
              />
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  The customer will be notified about the cancellation and the reason provided.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                onClick={cancelOrderCancel}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
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
