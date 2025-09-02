import React, { useState } from "react";
import {
  Trash,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Eye,
  ShoppingCart,
  X,
  Receipt,
  Edit2,
} from "lucide-react";
import ReceiptModal from "./ReceiptModal";
import type { Request } from "../types/request";
import type { BaseRequest } from "../types/shared";

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-300",
        icon: <Clock className="w-4 h-4" />,
      };

    // Supervisor Level
    case "supervisor approved":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-300",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    case "supervisor rejected":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-300",
        icon: <XCircle className="w-4 h-4" />,
      };

    // Technical Manager Level
    case "technical-manager approved":
    case "technical manager approved":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-300",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    case "technical-manager rejected":
    case "technical manager rejected":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-300",
        icon: <XCircle className="w-4 h-4" />,
      };

    // Engineer Level
    case "engineer approved":
      return {
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        border: "border-cyan-300",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    case "engineer rejected":
      return {
        bg: "bg-pink-50",
        text: "text-pink-700",
        border: "border-pink-300",
        icon: <XCircle className="w-4 h-4" />,
      };

    // Final States
    case "complete":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-300",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    case "Engineer Approved":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-300",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    case "order placed":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-300",
        icon: <ShoppingCart className="w-4 h-4" />,
      };
    case "order cancelled":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-300",
        icon: <X className="w-4 h-4" />,
      };

    // Legacy statuses
    case "approved":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-300",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    case "rejected":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-300",
        icon: <XCircle className="w-4 h-4" />,
      };

    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-300",
        icon: <Clock className="w-4 h-4" />,
      };
  }
};

// Function to get descriptive status text based on who made the decision
const getDescriptiveStatus = (request: Request) => {
  if (request.status === "pending") {
    return "User Requested tire";
  }

  if (request.status === "complete" || request.status === "Engineer Approved") {
    return "Engineer Approved";
  }

  if (request.status === "rejected") {
    // Check who rejected it based on notes and decision_by fields
    if (request.supervisor_notes && request.supervisor_decision_by) {
      return "supervisor rejected";
    } else if (request.technical_manager_note && request.technical_manager_id) {
      return "technical manager rejected";
    } else if (request.engineer_note && request.engineer_decision_by) {
      return "engineer rejected";
    }
    return "rejected";
  }
  return request.status;
};

interface RequestTableProps {
  requests: Request[];
  title: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (request: Request) => void;
  onDelete: (id: string) => void;
  onPlaceOrder: (request: Request) => void;
  onCancelOrder?: (id: string) => void;
  onUpdate?: (request: any) => void;

  showActions?: boolean;
  showPlaceOrderButton?: boolean;
  showCancelButton?: boolean;
  showDeleteButton?: boolean;
}

const RequestTable: React.FC<RequestTableProps> = ({
  requests,
  title,
  onApprove,
  onReject,
  onView,
  onDelete,
  onPlaceOrder,
  onCancelOrder,
  onUpdate,

  showActions = true,
  showPlaceOrderButton = false,
  showCancelButton = false,
  showDeleteButton = true,
}) => {
  const [sortField, setSortField] = useState<keyof Request>("submittedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<Request | null>(null);
  const requestsPerPage = 5;

  const handleSort = (field: keyof Request) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Sort and paginate the requests
  const sortedRequests = [...requests].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const numA = Number(aValue);
    const numB = Number(bValue);

    if (!isNaN(numA) && !isNaN(numB)) {
      return sortDirection === "asc" ? numA - numB : numB - numA;
    }

    return 0;
  });

  const totalPages = Math.ceil(requests.length / requestsPerPage);
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = sortedRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="flex items-center justify-between text-lg font-semibold text-gray-800">
          <span>{title}</span>
          <span className="text-sm text-gray-500">
            {requests.length} requests
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                <button
                  className="flex items-center space-x-1 text-left"
                  onClick={() => handleSort("submittedAt")}
                >
                  <span>Date</span>
                </button>
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Vehicle Info
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                <button
                  className="flex items-center space-x-1 text-left"
                  onClick={() => handleSort("requesterName")}
                >
                  <span>Requester</span>
                </button>
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Status
              </th>
              {showActions && (
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRequests.map((request) => (
              <tr
                key={request.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onView(request)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(request.submittedAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {request.vehicleNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.vehicleBrand} {request.vehicleModel}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {request.requesterName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.userSection}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${getStatusStyles(request.status).bg}
                      ${getStatusStyles(request.status).text}
                      ${getStatusStyles(request.status).border}
                      border
                    `}
                  >
                    {getStatusStyles(request.status).icon}
                    <span className="ml-1">
                      {getDescriptiveStatus(request)}
                    </span>
                  </span>
                </td>
                {showActions && (
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* Add update button for pending requests */}
                      {(request.status === "pending" ||
                        request.status.toLowerCase() ===
                          "user requested tire") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate?.(request);
                          }}
                          className="p-2 text-gray-500 transition-colors rounded-lg hover:text-blue-700 hover:bg-blue-50"
                          aria-label="Update Request"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(request);
                        }}
                        className="p-2 text-gray-500 transition-colors rounded-lg hover:text-blue-700 hover:bg-blue-50"
                        aria-label="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {/* Hide approve/reject buttons for users, only show for specific roles */}
                      {(window.location.pathname.includes("/supervisor/") ||
                        window.location.pathname.includes(
                          "/technical-manager/"
                        ) ||
                        window.location.pathname.includes("/engineer/")) &&
                        (request.status?.toLowerCase() === "pending" ||
                          request.status?.toLowerCase() ===
                            "supervisor approved" ||
                          request.status?.toLowerCase() ===
                            "technical-manager approved" ||
                          request.status?.toLowerCase() ===
                            "technical manager approved") && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onApprove(request.id);
                              }}
                              className="px-4 text-emerald-600 hover:text-emerald-800"
                              aria-label="Approve"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReject(request.id);
                              }}
                              className="px-4 text-red-600 hover:text-red-800"
                              aria-label="Reject"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}

                      {showPlaceOrderButton &&
                        (request.status?.toLowerCase().trim() === "complete" ||
                          request.status?.toLowerCase().trim() ===
                            "engineer approved") &&
                        !(request as any).order_placed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlaceOrder(request);
                            }}
                            className="px-4 text-gray-500 hover:text-green-700"
                            aria-label="Place Order"
                            title="Place Order"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        )}

                      {showCancelButton &&
                        (request.status?.toLowerCase().trim() === "complete" ||
                          request.status?.toLowerCase().trim() ===
                            "engineer approved") &&
                        onCancelOrder && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelOrder(request.id);
                            }}
                            className="px-4 text-gray-500 hover:text-orange-700"
                            aria-label="Cancel Order"
                            title="Cancel Order"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}

                      {/* View/Download Receipt Button - Only show for order placed status */}
                      {request.status?.toLowerCase() === "order placed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceipt(request);
                          }}
                          className="flex items-center gap-1 px-4 text-gray-500 hover:text-emerald-700"
                          aria-label="View Receipt"
                          title="View Receipt"
                        >
                          <Receipt className="w-5 h-5" />
                        </button>
                      )}

                      {showDeleteButton && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(request.id);
                          }}
                          className="px-4 text-gray-500 hover:text-red-700"
                          aria-label="Delete"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {indexOfFirstRequest + 1} to{" "}
              {Math.min(indexOfLastRequest, requests.length)} of{" "}
              {requests.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        request={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};

export default RequestTable;
