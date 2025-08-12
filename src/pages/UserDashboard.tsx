import { useState, useEffect, useRef } from "react";
import TireRequestForm from "../components/TireRequestForm";
import RequestTable from "../components/RequestTable";
import { TireRequest } from "../types/api";
import { useAuth } from "../contexts/AuthContext";
import { useRequests } from "../contexts/RequestContext";
import { apiUrls } from "../config/api";
import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  LogOut,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Activity,
  ShoppingCart,
  Package,
  X,
} from "lucide-react";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { requests, fetchRequests } = useRequests();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Removed selectedRequest state - using navigation instead of modal
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Filter user's own requests
  const userRequests = requests.filter((req: any) => req.userId === user?.id);
  const pendingRequests = userRequests.filter(
    (req: any) => req.status === "pending"
  );
  const approvedRequests = userRequests.filter(
    (req: any) =>
      req.status === "supervisor approved" ||
      req.status === "technical-manager approved" ||
      req.status === "engineer approved"
  );
  const rejectedRequests = userRequests.filter(
    (req: any) =>
      req.status === "supervisor rejected" ||
      req.status === "technical-manager rejected" ||
      req.status === "engineer rejected"
  );
  const placeOrderRequests = userRequests.filter(
    (req: any) => req.status === "order placed"
  );
  const completeOrderRequests = userRequests.filter(
    (req: any) => req.status === "complete"
  );
  const cancelOrderRequests = userRequests.filter(
    (req: any) => req.status === "order cancelled"
  );

  // Filter requests based on active filter
  const getFilteredRequests = () => {
    switch (activeFilter) {
      case "pending":
        return pendingRequests;
      case "approved":
        return approvedRequests;
      case "rejected":
        return rejectedRequests;
      case "place-orders":
        return placeOrderRequests;
      case "complete-orders":
        return completeOrderRequests;
      case "cancel-orders":
        return cancelOrderRequests;
      default:
        return userRequests;
    }
  };

  const filteredRequests = getFilteredRequests();

  // Convert TireRequest to Request format for RequestTable
  const convertTireRequestToRequest = (tireRequest: any) => {
    return {
      ...tireRequest,
      submittedAt: tireRequest.submittedAt || new Date().toISOString(),
      userSection: tireRequest.userSection || "Unknown Department",
    };
  };

  // Handler functions for RequestTable
  const handleView = (request: any) => {
    navigate(`/user/request/${request.id}`);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(apiUrls.requestById(deleteId), {
        method: "DELETE",
      });

      if (response.ok) {
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

  const handleApprove = (id: string) => {
    console.log("Approve request:", id);
  };

  const handleReject = (id: string) => {
    console.log("Reject request:", id);
  };

  const handlePlaceOrder = (request: any) => {
    console.log("Place order for request:", request);
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
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  User Dashboard
                </h1>
                <p className="text-slate-300 text-lg font-medium mt-1">
                  Submit tire requests and track your applications
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400 font-medium">
                    User Level Access
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-sm text-slate-400">
                    Welcome back, {user?.name || "User"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Quick Actions */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <div className="text-xs text-slate-300 font-medium">
                    Current Time
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {currentTime.toLocaleTimeString()}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <div className="text-xs text-slate-300 font-medium">
                    Today's Date
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {currentTime.toLocaleDateString()}
                  </div>
                </div>
              </div>
              {/* Enhanced User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">
                    {user?.name || "User"}
                  </div>
                  <div className="text-xs text-slate-300">User</div>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20 hover:shadow-xl transition-all duration-200"
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

          <div className="flex flex-col space-y-4">
            {/* Professional Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowRequestForm(!showRequestForm)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>
                  {showRequestForm ? "Hide Request Form" : "New Tire Request"}
                </span>
              </button>
              <button
                onClick={() => {
                  navigate('/user/inquiry-dashboard');
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>User Inquiry</span>
              </button>
            </div>


          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-6">
        <div className="space-y-8">
          {/* Professional Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div
              onClick={() =>
                setActiveFilter(activeFilter === "pending" ? "all" : "pending")
              }
              className={`bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-8 text-white shadow-xl border border-yellow-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                activeFilter === "pending"
                  ? "ring-4 ring-yellow-300 ring-opacity-50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium mb-2">
                    Pending Requests
                  </p>
                  <p className="text-4xl font-bold mb-1">
                    {pendingRequests.length}
                  </p>
                  <p className="text-yellow-200 text-xs">Awaiting review</p>
                </div>
                <div className="w-16 h-16 bg-yellow-400/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div
              onClick={() =>
                setActiveFilter(
                  activeFilter === "approved" ? "all" : "approved"
                )
              }
              className={`bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl border border-emerald-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                activeFilter === "approved"
                  ? "ring-4 ring-emerald-300 ring-opacity-50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-2">
                    Approved
                  </p>
                  <p className="text-4xl font-bold mb-1">
                    {approvedRequests.length}
                  </p>
                  <p className="text-emerald-200 text-xs">
                    Successfully approved
                  </p>
                </div>
                <div className="w-16 h-16 bg-emerald-400/30 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div
              onClick={() =>
                setActiveFilter(
                  activeFilter === "rejected" ? "all" : "rejected"
                )
              }
              className={`bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-8 text-white shadow-xl border border-rose-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                activeFilter === "rejected"
                  ? "ring-4 ring-rose-300 ring-opacity-50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm font-medium mb-2">
                    Rejected
                  </p>
                  <p className="text-4xl font-bold mb-1">
                    {rejectedRequests.length}
                  </p>
                  <p className="text-rose-200 text-xs">Needs revision</p>
                </div>
                <div className="w-16 h-16 bg-rose-400/30 rounded-xl flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div
              onClick={() =>
                setActiveFilter(
                  activeFilter === "place-orders" ? "all" : "place-orders"
                )
              }
              className={`bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                activeFilter === "place-orders"
                  ? "ring-4 ring-blue-300 ring-opacity-50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-2">
                    Place Orders
                  </p>
                  <p className="text-4xl font-bold mb-1">
                    {placeOrderRequests.length}
                  </p>
                  <p className="text-blue-200 text-xs">Orders placed</p>
                </div>
                <div className="w-16 h-16 bg-blue-400/30 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div
              onClick={() =>
                setActiveFilter(
                  activeFilter === "complete-orders" ? "all" : "complete-orders"
                )
              }
              className={`bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-8 text-white shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                activeFilter === "complete-orders"
                  ? "ring-4 ring-purple-300 ring-opacity-50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-2">
                    Complete Orders
                  </p>
                  <p className="text-4xl font-bold mb-1">
                    {completeOrderRequests.length}
                  </p>
                  <p className="text-purple-200 text-xs">Orders completed</p>
                </div>
                <div className="w-16 h-16 bg-purple-400/30 rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div
              onClick={() =>
                setActiveFilter(
                  activeFilter === "cancel-orders" ? "all" : "cancel-orders"
                )
              }
              className={`bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl p-8 text-white shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                activeFilter === "cancel-orders"
                  ? "ring-4 ring-slate-300 ring-opacity-50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100 text-sm font-medium mb-2">
                    Cancel Orders
                  </p>
                  <p className="text-4xl font-bold mb-1">
                    {cancelOrderRequests.length}
                  </p>
                  <p className="text-slate-200 text-xs">Orders cancelled</p>
                </div>
                <div className="w-16 h-16 bg-slate-400/30 rounded-xl flex items-center justify-center">
                  <X className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Tire Request Form Section */}
          {showRequestForm && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-green-900">
                      Submit New Tire Request
                    </h2>
                    <p className="text-green-700 text-sm">
                      Fill out the form below to request new tires for your
                      vehicle
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <TireRequestForm
                  onSuccess={() => {
                    setShowRequestForm(false);
                    fetchRequests();
                  }}
                />
              </div>
            </div>
          )}

          {/* Your Tire Requests Section with Color-Coded Statuses */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">
                    Your Tire Requests
                    {activeFilter !== "all" && (
                      <span className="ml-2 text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {activeFilter === "pending" && "Pending"}
                        {activeFilter === "approved" && "Approved"}
                        {activeFilter === "rejected" && "Rejected"}
                        {activeFilter === "place-orders" && "Orders Placed"}
                        {activeFilter === "complete-orders" &&
                          "Completed Orders"}
                        {activeFilter === "cancel-orders" && "Cancelled Orders"}
                      </span>
                    )}
                  </h2>
                  <p className="text-blue-700 text-sm">
                    {activeFilter === "all"
                      ? "Track the status of your tire requests with color-coded indicators"
                      : `Showing ${
                          activeFilter === "pending"
                            ? "pending"
                            : activeFilter === "approved"
                            ? "approved"
                            : activeFilter === "rejected"
                            ? "rejected"
                            : activeFilter === "place-orders"
                            ? "orders that have been placed"
                            : activeFilter === "complete-orders"
                            ? "completed orders"
                            : "cancelled orders"
                        } requests`}
                    {activeFilter !== "all" && (
                      <button
                        onClick={() => setActiveFilter("all")}
                        className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        Show All
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              {filteredRequests.length > 0 ? (
                <RequestTable
                  requests={filteredRequests.map(convertTireRequestToRequest)}
                  title=""
                  onView={handleView}
                  onDelete={handleDelete}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onPlaceOrder={handlePlaceOrder}
                  showActions={true}
                  showPlaceOrderButton={false}
                  showCancelButton={false}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-gray-500 text-lg mb-2 font-medium">
                    {activeFilter === "all"
                      ? "No requests found"
                      : `No ${
                          activeFilter === "pending"
                            ? "pending"
                            : activeFilter === "approved"
                            ? "approved"
                            : activeFilter === "rejected"
                            ? "rejected"
                            : activeFilter === "place-orders"
                            ? "placed orders"
                            : activeFilter === "complete-orders"
                            ? "completed orders"
                            : "cancelled orders"
                        } found`}
                  </div>
                  <p className="text-gray-400 text-sm mb-6">
                    {activeFilter === "all"
                      ? "Submit your first tire request using the form above"
                      : `You don't have any ${
                          activeFilter === "pending"
                            ? "pending"
                            : activeFilter === "approved"
                            ? "approved"
                            : activeFilter === "rejected"
                            ? "rejected"
                            : activeFilter === "place-orders"
                            ? "placed orders"
                            : activeFilter === "complete-orders"
                            ? "completed orders"
                            : "cancelled orders"
                        } at the moment.`}
                  </p>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create First Request</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900">Quick Tips</h3>
                <p className="text-blue-700 text-sm">
                  Important information for tire requests
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Before Submitting
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ensure your vehicle is registered in the system</li>
                  <li>• Check current tire condition and wear patterns</li>
                  <li>• Have your vehicle's current KM reading ready</li>
                  <li>• Take photos of tire damage if applicable</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Request Process
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Requests are reviewed by supervisors first</li>
                  <li>• Technical managers verify technical requirements</li>
                  <li>• Engineers handle implementation details</li>
                  <li>• Customer officers manage final orders</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={cancelDelete}
        >
          <div
            className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this tire request? All associated
              data will be permanently removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
                onClick={confirmDelete}
              >
                <XCircle className="w-4 h-4" />
                <span>Delete Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;