import { useState, useEffect, useRef } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import RequestTable from "../components/RequestTable";
import RequestReports from "../components/RequestReports";
import { UserCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Request } from "../types/request";

interface RequestsContextType {
  requests: Request[];
  fetchRequests: () => Promise<void>;
  updateRequestStatus: (
    id: string,
    status: string,
    notes: string
  ) => Promise<void>;
}

interface AuthContextType {
  currentUser: {
    name: string;
    email: string;
  } | null;
  logout: () => Promise<void>;
}

const TechnicalManagerDashboard = () => {
  const { requests, fetchRequests, updateRequestStatus } =
    useRequests() as RequestsContextType;
  const { logout } = useAuth() as unknown as AuthContextType;
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [notes, setNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"requests" | "reports">(
    "requests"
  );
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Wrap fetchRequests with loading state
  const fetchRequestsWithLoading = async () => {
    setIsLoading(true);
    try {
      await fetchRequests();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsWithLoading();
  }, []);

  const pendingRequests = requests.filter(
    (req) => req.status === "supervisor approved"
  );
  const approvedRequests = requests.filter(
    (req) => req.status === "technical-manager approved"
  );
  const rejectedRequests = requests.filter((req) => req.status === "rejected");

  const handleApprove = (requestId: string) => {
    setSelectedRequest(requests.find((r) => r.id === requestId) || null);
    setIsApproving(true);
    setShowNotesModal(true);
  };

  const handleReject = (requestId: string) => {
    setSelectedRequest(requests.find((r) => r.id === requestId) || null);
    setIsApproving(false);
    setShowNotesModal(true);
  };

  const handleNotesSubmit = async () => {
    if (!selectedRequest || !notes.trim()) {
      alert("Please add notes");
      return;
    }

    try {
      await updateRequestStatus(
        selectedRequest.id,
        isApproving ? "technical-manager approved" : "rejected",
        notes
      );
      setShowNotesModal(false);
      setSelectedRequest(null);
      setNotes("");
      fetchRequests();
    } catch (error) {
      alert("Failed to update request status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          

          {/* Navigation Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab("requests")}
                className={`${
                  activeTab === "requests"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition duration-150 ease-in-out`}
              >
                Pending Reviews
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`${
                  activeTab === "reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition duration-150 ease-in-out`}
              >
                Technical Analytics
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
            {/* Pending Requests */}
            <RequestTable
              requests={pendingRequests}
              title="Pending Technical Review"
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={() => {}}
              onView={(request) =>
                navigate(`/technical-manager/request/${request.id}`)
              }
              showActions={false}
            />

            {/* Approved Requests */}
            <RequestTable
              requests={approvedRequests}
              title="Technically Approved Requests"
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={() => {}}
              onView={(request) =>
                navigate(`/technical-manager/request/${request.id}`)
              }
              showActions={false}
            />

            {/* Rejected Requests */}
            <RequestTable
              requests={rejectedRequests}
              title="Technically Rejected Requests"
              onApprove={handleApprove}
              onReject={handleReject}
              onView={(request) =>
                navigate(`/technical-manager/request/${request.id}`)
              }
              onDelete={() => {}}
              showActions={false}
            />
          </div>
        ) : (
          <RequestReports requests={requests} role="technical-manager" />
        )}
      </main>

      {/* Notes Modal */}
      {showNotesModal && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold">
              {isApproving ? "Technical Approval" : "Technical Rejection"} Notes
            </h3>
            <textarea
              className="w-full h-32 p-2 border rounded-md"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter technical review notes..."
            />
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedRequest(null);
                  setNotes("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleNotesSubmit}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalManagerDashboard;
