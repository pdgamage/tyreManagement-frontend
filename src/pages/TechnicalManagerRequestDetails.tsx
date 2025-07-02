import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRequests } from "../contexts/RequestContext";
import { Request } from "../types/request";

const TechnicalManagerRequestDetails = () => {
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
        if (isNaN(numericId)) throw new Error("Invalid request ID.");
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/requests/${numericId}`
        );
        if (!res.ok) throw new Error("Failed to fetch request.");
        const data = await res.json();
        setRequest(data);
        if (
          data.status !== "supervisor approved" &&
          data.technical_manager_notes
        ) {
          setNotes(data.technical_manager_notes);
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
    setIsApproving(true);
    try {
      await updateRequestStatus(
        id!,
        approve ? "technical-manager approved" : "rejected",
        notes
      );
      await fetchRequests();
      navigate("/technical-manager");
    } catch {
      alert("Failed to update request status");
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) return <div className="p-8 text-left">Loading...</div>;
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
          Back
        </button>
        <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-blue-700">
          <span>Request {request.id}</span>
          <span
            className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold
              ${
                request.status === "supervisor approved"
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
        {/* ...Display request details similar to SupervisorRequestDetails... */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Technical Manager Notes
          </label>
          <textarea
            className="w-full p-2 mt-1 border rounded"
            placeholder="Enter notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            readOnly={request.status !== "supervisor approved"}
          />
        </div>
        <div className="flex gap-4 mt-6">
          {request.status === "supervisor approved" && (
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
            onClick={() => navigate("/technical-manager")}
          >
            Cancel
          </button>
        </div>
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

export default TechnicalManagerRequestDetails;
