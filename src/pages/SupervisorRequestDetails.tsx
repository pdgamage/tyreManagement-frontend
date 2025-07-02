import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRequests } from "../contexts/RequestContext";
import { Request } from "../types/request";

const SupervisorRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { updateRequestStatus, fetchRequests } = useRequests();
  const [request, setRequest] = useState<Request | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isNaN(numericId)) {
          throw new Error("Invalid request ID.");
        }
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/requests/${numericId}`
        );
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Request not found.");
          }
          throw new Error("Failed to fetch request.");
        }
        const data = await res.json();
        setRequest(data);
        // If not pending, set notes to supervisor_notes from backend
        if (data.status !== "pending" && data.supervisor_notes) {
          setNotes(data.supervisor_notes);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load request");
      }
      setLoading(false);
    };
    fetchRequest();
  }, [id]);

  const handleAction = async (approve: boolean) => {
    if (!notes.trim()) {
      alert("Please enter notes");
      return;
    }
    setIsApproving(true); // Start loading
    try {
      await updateRequestStatus(
        id!,
        approve ? "supervisor approved" : "rejected",
        notes
      );
      await fetchRequests();
      navigate("/supervisor");
    } catch {
      alert("Failed to update request status");
    } finally {
      setIsApproving(false); // End loading
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error)
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!request)
    return (
      <div className="p-8 text-center text-red-600">Request not found.</div>
    );

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-5xl p-8 mt-10 bg-white shadow-lg md:w-4/5 rounded-xl">
        <button
          className="px-4 py-2 mb-4 text-blue-700 transition bg-blue-100 rounded hover:bg-blue-200"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-blue-700">
          <span>Request #{request.id}</span>
          <span
            className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold
          ${
            request.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : request.status === "rejected"
              ? "bg-red-100 text-red-800"
              : request.status.includes("approved")
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        `}
          >
            {request.status.replace(/_/g, " ")}
          </span>
        </h2>
        <form className="space-y-10">
          {/* Vehicle & Requester Info */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Vehicle & Requester Info
            </h3>
            <div className="grid grid-cols-1 gap-6 p-6 rounded-lg md:grid-cols-2 bg-gray-50">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Vehicle Number
                </label>
                <div className="p-2 bg-white rounded">
                  {request.vehicleNumber}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Vehicle Brand
                </label>
                <div className="p-2 bg-white rounded">
                  {request.vehicleBrand}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Vehicle Model
                </label>
                <div className="p-2 bg-white rounded">
                  {request.vehicleModel}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Year
                </label>
                <div className="p-2 bg-white rounded">{request.year}</div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Department/Section
                </label>
                <div className="p-2 bg-white rounded">
                  {request.userSection}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Cost Center
                </label>
                <div className="p-2 bg-white rounded">{request.costCenter}</div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Requester Name
                </label>
                <div className="p-2 bg-white rounded">
                  {request.requesterName}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Requester Email
                </label>
                <div className="p-2 bg-white rounded">
                  {request.requesterEmail}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Requester Phone
                </label>
                <div className="p-2 bg-white rounded">
                  {request.requesterPhone}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Submitted At
                </label>
                <div className="p-2 bg-white rounded">
                  {new Date(request.submittedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <hr />
          {/* Tire & Request Details */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Tire & Request Details
            </h3>
            <div className="grid grid-cols-1 gap-6 p-6 rounded-lg md:grid-cols-2 bg-gray-50">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tire Size Required
                </label>
                <div className="p-2 bg-white rounded">
                  {request.tireSizeRequired}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Quantity
                </label>
                <div className="p-2 bg-white rounded">{request.quantity}</div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tubes Quantity
                </label>
                <div className="p-2 bg-white rounded">
                  {request.tubesQuantity}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Existing Tire Make
                </label>
                <div className="p-2 bg-white rounded">
                  {request.existingTireMake}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Last Replacement Date
                </label>
                <div className="p-2 bg-white rounded">
                  {request.lastReplacementDate
                    ? new Date(request.lastReplacementDate).toLocaleDateString()
                    : "-"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Present KM Reading
                </label>
                <div className="p-2 bg-white rounded">
                  {request.presentKmReading}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Previous KM Reading
                </label>
                <div className="p-2 bg-white rounded">
                  {request.previousKmReading}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tire Wear Pattern
                </label>
                <div className="p-2 bg-white rounded">
                  {request.tireWearPattern}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Request Reason
                </label>
                <div className="p-2 bg-white rounded">
                  {request.requestReason}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Comments
                </label>
                <div className="p-2 bg-white rounded">
                  {request.comments || "N/A"}
                </div>
              </div>
            </div>
          </div>
          <hr />
          {/* Images Section with error handling */}
          {request.images && request.images.length > 0 && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                Images
              </h3>
              <div className="flex flex-wrap gap-3 p-4 mt-2 rounded-lg bg-gray-50">
                {request.images.map((img, idx) =>
                  img ? (
                    <img
                      key={idx}
                      src={img}
                      alt={`Tire image ${idx + 1}`}
                      className="object-cover w-24 h-24 border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/96?text=Image+Not+Found";
                      }}
                    />
                  ) : null
                )}
              </div>
            </div>
          )}
          <hr />
          {/* Supervisor Notes */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Supervisor Notes
            </label>
            <textarea
              className="w-full p-2 mt-1 border rounded"
              placeholder="Enter notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              readOnly={request.status !== "pending"} // Make read-only if not pending
            />
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            {request.status === "pending" && (
              <>
                <button
                  type="button"
                  className="px-6 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
                  onClick={() => handleAction(true)}
                  disabled={isApproving}
                >
                  {isApproving ? "Approving..." : "Approve"}
                </button>
                <button
                  type="button"
                  className="px-6 py-2 text-white transition bg-red-600 rounded hover:bg-red-700"
                  onClick={() => setShowRejectConfirm(true)}
                >
                  Reject
                </button>
              </>
            )}
            <button
              type="button"
              className="px-6 py-2 transition bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => navigate("/supervisor")}
            >
              Cancel
            </button>
          </div>
        </form>
        {/* Reject Confirmation Modal */}
        {showRejectConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-red-700">
                Confirm Rejection
              </h3>
              <p className="mb-6">
                Are you sure you want to reject this request?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setShowRejectConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                  onClick={() => {
                    setShowRejectConfirm(false);
                    handleAction(false);
                  }}
                >
                  Yes, Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorRequestDetails;
