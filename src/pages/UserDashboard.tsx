import { useState, useEffect, useRef, useCallback } from "react";
import RequestTable from "../components/RequestTable";
import UserInquiry from "../components/UserInquiry";
import { useAuth } from "../contexts/AuthContext";
import { useRequests } from "../contexts/RequestContext";
import { apiUrls } from "../config/api";
import { useNavigate } from "react-router-dom";
import { UserCircle, FileText, Plus, XCircle, AlertCircle } from "lucide-react";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { requests, fetchRequests } = useRequests();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State management
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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

  // State for filters
  const [filters, setFilters] = useState<{
    vehicleNumber?: string;
    orderNumber?: string;
    supplierName?: string;
    status?: string;
  }>({});

  // Handle filter changes from UserInquiry component
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  // Handler functions for RequestTable
  const handleView = useCallback((request: any) => {
    navigate(`/user/request/${request.id}`);
  }, [navigate]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(apiUrls.requestById(deleteId), {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRequests(); // Refresh the list
      } else {
        console.error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }

    setShowDeleteConfirm(false);
    setDeleteId(null);
  }, [deleteId, fetchRequests]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  }, []);

  const handleApprove = useCallback((id: string) => {
    console.log("Approve request:", id);
  }, []);

  const handleReject = useCallback((id: string) => {
    console.log("Reject request:", id);
  }, []);

  const handlePlaceOrder = useCallback((request: any) => {
    console.log("Place order for request:", request);
  }, []);

  const convertTireRequestToRequest = useCallback((tireRequest: any) => ({
    ...tireRequest,
    submittedAt: tireRequest.submittedAt || new Date().toISOString(),
    userSection: tireRequest.userSection || "Unknown Department",
  }), []);

  // Filter user's own requests with memoization
  const userRequests = useCallback(() => {
    let filtered = requests.filter((req: any) => req.userId === user?.id);

    // Apply filters if any
    if (filters.vehicleNumber) {
      filtered = filtered.filter((req: any) => 
        req.vehicleNumber?.toLowerCase().includes(filters.vehicleNumber?.toLowerCase())
      );
    }
    
    if (filters.orderNumber) {
      filtered = filtered.filter((req: any) => 
        req.orderNumber?.toLowerCase().includes(filters.orderNumber?.toLowerCase())
      );
    }
    
    if (filters.supplierName) {
      filtered = filtered.filter((req: any) => 
        req.supplierName?.toLowerCase().includes(filters.supplierName?.toLowerCase())
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter((req: any) => 
        req.status?.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    return filtered;
  }, [requests, user?.id, filters]);

  const filteredRequests = userRequests();
  const pendingRequests = filteredRequests.filter(
    (req: any) => req.status === "pending"
  );
  const approvedRequests = filteredRequests.filter(
    (req: any) =>
      req.status === "supervisor approved" ||
      req.status === "technical-manager approved" ||
      req.status === "engineer approved"
  );
  const rejectedRequests = filteredRequests.filter(
    (req: any) =>
      req.status === "supervisor rejected" ||
      req.status === "technical-manager rejected" ||
      req.status === "engineer rejected"
  );
  const placeOrderRequests = filteredRequests.filter(
    (req: any) => req.status === "order placed"
  );
  const completeOrderRequests = filteredRequests.filter(
    (req: any) => req.status === "complete"
  );
  const cancelOrderRequests = filteredRequests.filter(
    (req: any) => req.status === "order cancelled"
  );

  // Debug: Log the status values to see what we have (can be removed in production)
  // console.log("All user requests statuses:", userRequests.map((req: any) => req.status));
  // console.log("Place order requests (complete):", placeOrderRequests.length);
  // console.log("Complete order requests (order placed):", completeOrderRequests.length);
  // console.log("Cancel order requests (order cancelled):", cancelOrderRequests.length);
  // console.log("Active filter:", activeFilter);

  // Filter requests based on active filter
  const filteredByStatus = (() => {
    switch (activeFilter) {
      case "pending":
        return pendingRequests;
      case "approved":
        return approvedRequests;
      case "rejected":
        return rejectedRequests;
      case "order-placed":
        return placeOrderRequests;
      case "complete":
        return completeOrderRequests;
      case "cancelled":
        return cancelOrderRequests;
      default:
        return filteredRequests;
    }
  })();

  // Handler functions are already defined above with useCallback

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header with Enhanced Design */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-white">
                  Tire Management System
                </h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a
                  href="#"
                  className="text-blue-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="text-blue-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Requests
                </a>
                <a
                  href="#"
                  className="text-blue-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Reports
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-white hover:text-blue-100 transition-colors duration-200"
                >
                  <UserCircle className="h-8 w-8 text-blue-200" />
                  <span className="hidden md:inline">{user?.name || 'User'}</span>
                </button>

                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Inquiry Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <UserInquiry onFilterChange={handleFilterChange} onReset={handleResetFilters} />
          </div>

          {/* Your Tire Requests Section with Color-Coded Statuses */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
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

            {filteredRequests.length > 0 ? (
              <RequestTable
                requests={filteredByStatus.map(convertTireRequestToRequest)}
                title="My Requests"
                onApprove={handleApprove}
                onReject={handleReject}
                onView={handleView}
                onDelete={handleDelete}
                onPlaceOrder={handlePlaceOrder}
                onCancelOrder={() => {}}
                showActions={true}
                showPlaceOrderButton={true}
                showCancelButton={true}
                showDeleteButton={true}
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
                  onClick={() => navigate('/create-request')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create First Request</span>
                </button>
              </div>
            )}
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
