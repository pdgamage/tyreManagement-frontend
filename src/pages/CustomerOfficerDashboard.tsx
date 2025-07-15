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
  const { requests, fetchRequests } = useRequests() as RequestsContextType;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"requests" | "reports">(
    "requests"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [orderRequest, setOrderRequest] = useState<Request | null>(null);

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
              onDelete={() => {}}
              onPlaceOrder={handlePlaceOrder}
              showActions={true}
              showPlaceOrderButton={true} // Enable place order button for customer officers
            />
          </div>
        ) : (
          <RequestReports requests={completeRequests} role="customer-officer" />
        )}
      </main>

      {/* Place Order Modal */}
      <PlaceOrderModal
        request={orderRequest}
        isOpen={showPlaceOrderModal}
        onClose={() => setShowPlaceOrderModal(false)}
        onOrderPlaced={handleOrderPlaced}
      />
    </div>
  );
};

export default CustomerOfficerDashboard;
