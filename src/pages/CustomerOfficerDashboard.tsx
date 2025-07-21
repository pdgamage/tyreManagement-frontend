import { useState, useEffect, useRef } from "react";
import { useRequests } from "../contexts/RequestContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import PlaceOrderModal from "../components/PlaceOrderModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserCircle, ChevronDown, LogOut, ShoppingCart, BarChart3, Package, XCircle, CheckCircle2 } from "lucide-react";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"requests" | "reports">(
    "requests"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [orderRequest, setOrderRequest] = useState<Request | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header with Enhanced Design */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Enhanced Header Title Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Customer Officer Dashboard
                </h1>
                <p className="text-slate-300 text-lg font-medium mt-1">
                  Manage orders, track deliveries, and oversee customer fulfillment
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400 font-medium">Customer Service Level Access</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-sm text-slate-400">Welcome back, {user?.name || 'Customer Officer'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Quick Actions */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <div className="text-xs text-slate-300 font-medium">Active Orders</div>
                  <div className="text-sm font-semibold text-white">{completeRequests.length}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <div className="text-xs text-slate-300 font-medium">Cancelled</div>
                  <div className="text-sm font-semibold text-white">{cancelledRequests.length}</div>
                </div>
              </div>
              {/* Enhanced User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">{user?.name || 'Customer Officer'}</div>
                  <div className="text-xs text-slate-300">Customer Officer</div>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20 hover:shadow-xl transition-all duration-200"
                  >
                    <UserCircle className="w-6 h-6 text-white" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 w-48 py-1 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Tab Navigation */}
          <div className="flex space-x-2 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
            <button
              onClick={() => setActiveTab("requests")}
              className={`${
                activeTab === "requests"
                  ? "bg-white text-slate-700 shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/20"
              } flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3`}
            >
              <Package className="w-6 h-6" />
              <span>Order Management</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                {completeRequests.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`${
                activeTab === "reports"
                  ? "bg-white text-slate-700 shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/20"
              } flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3`}
            >
              <BarChart3 className="w-6 h-6" />
              <span>Customer Analytics</span>
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        ) : activeTab === "requests" ? (
          <div className="space-y-8">
            {/* Professional Overview Cards with Enhanced Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-xl border border-emerald-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-2">Active Orders</p>
                    <p className="text-4xl font-bold mb-1">{completeRequests.length}</p>
                    <p className="text-emerald-200 text-xs">Ready for fulfillment</p>
                  </div>
                  <div className="w-16 h-16 bg-emerald-400/30 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl border border-red-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-2">Cancelled Orders</p>
                    <p className="text-4xl font-bold mb-1">{cancelledRequests.length}</p>
                    <p className="text-red-200 text-xs">Customer cancellations</p>
                  </div>
                  <div className="w-16 h-16 bg-red-400/30 rounded-xl flex items-center justify-center">
                    <XCircle className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-2">Total Orders</p>
                    <p className="text-4xl font-bold mb-1">{completeRequests.length + cancelledRequests.length}</p>
                    <p className="text-blue-200 text-xs">All order activities</p>
                  </div>
                  <div className="w-16 h-16 bg-blue-400/30 rounded-xl flex items-center justify-center">
                    <Package className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-8 text-white shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-2">Success Rate</p>
                    <p className="text-4xl font-bold mb-1">
                      {completeRequests.length + cancelledRequests.length > 0
                        ? Math.round((completeRequests.length / (completeRequests.length + cancelledRequests.length)) * 100)
                        : 0}%
                    </p>
                    <p className="text-purple-200 text-xs">Order completion rate</p>
                  </div>
                  <div className="w-16 h-16 bg-purple-400/30 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Enhanced Active Orders Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-8 py-6 border-b border-emerald-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-emerald-900">Active Orders & Completed Requests</h2>
                      <p className="text-emerald-700 text-sm">Orders ready for fulfillment and delivery</p>
                    </div>
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

              {/* Enhanced Cancelled Orders Section */}
              {cancelledRequests.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 px-8 py-6 border-b border-red-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-red-900">Cancelled Orders</h2>
                        <p className="text-red-700 text-sm">Orders cancelled by customer or system</p>
                      </div>
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
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-8 py-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Customer Analytics & Reports</h2>
                  <p className="text-blue-700 text-sm">Comprehensive order fulfillment insights</p>
                </div>
              </div>
            </div>
            <div className="p-8">
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
