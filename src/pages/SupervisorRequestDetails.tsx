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
          `${import.meta.env.VITE_API_URL}/api/requests/${numericId}`
        );
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Request not found.");
          }
          throw new Error("Failed to fetch request.");
        }
        const data = await res.json();
        setRequest(data);
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
    <div className="max-w-2xl p-8 mx-auto mt-10 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center gap-2 mb-6 text-3xl font-bold text-blue-700">
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
      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Vehicle Number
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.vehicleNumber}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Vehicle Brand
            </label>
            <div className="p-2 rounded bg-gray-50">{request.vehicleBrand}</div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Vehicle Model
            </label>
            <div className="p-2 rounded bg-gray-50">{request.vehicleModel}</div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Year
            </label>
            <div className="p-2 rounded bg-gray-50">{request.year}</div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Department/Section
            </label>
            <div className="p-2 rounded bg-gray-50">{request.userSection}</div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Cost Center
            </label>
            <div className="p-2 rounded bg-gray-50">{request.costCenter}</div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Requester Name
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.requesterName}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Requester Email
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.requesterEmail}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Requester Phone
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.requesterPhone}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Submitted At
            </label>
            <div className="p-2 rounded bg-gray-50">
              {new Date(request.submittedAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Tire Size Required
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.tireSizeRequired}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Quantity
            </label>
            <div className="p-2 rounded bg-gray-50">{request.quantity}</div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Tubes Quantity
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.tubesQuantity}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Existing Tire Make
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.existingTireMake}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Last Replacement Date
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.lastReplacementDate
                ? new Date(request.lastReplacementDate).toLocaleDateString()
                : "-"}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Present KM Reading
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.presentKmReading}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Previous KM Reading
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.previousKmReading}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Tire Wear Pattern
            </label>
            <div className="p-2 rounded bg-gray-50">
              {request.tireWearPattern}
            </div>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Request Reason
          </label>
          <div className="p-2 rounded bg-gray-50">{request.requestReason}</div>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Comments
          </label>
          <div className="p-2 rounded bg-gray-50">
            {request.comments || "N/A"}
          </div>
        </div>
        {request.images && request.images.length > 0 && (
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Images
            </label>
            <div className="flex flex-wrap gap-3 mt-2">
              {request.images.map((img, idx) =>
                img ? (
                  <img
                    key={idx}
                    src={img}
                    alt={`Tire image ${idx + 1}`}
                    className="object-cover w-24 h-24 border rounded"
                  />
                ) : null
              )}
            </div>
          </div>
        )}
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
          />
        </div>
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
            onClick={() => handleAction(true)}
          >
            Approve
          </button>
          <button
            type="button"
            className="px-6 py-2 text-white transition bg-red-600 rounded hover:bg-red-700"
            onClick={() => setShowRejectConfirm(true)}
          >
            Reject
          </button>
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
  );
};

export default SupervisorRequestDetails;
