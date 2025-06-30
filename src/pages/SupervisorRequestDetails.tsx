import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRequests } from "../contexts/RequestContext";
import { Request } from "../types/request";

const SupervisorRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { updateRequestStatus, fetchRequests } = useRequests();
  const [request, setRequest] = useState<Request | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${id}`);
        if (!res.ok) throw new Error("Failed to fetch request");
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        setError("Failed to load request");
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
  if (error || !request) return <div className="p-8 text-center text-red-600">{error || "Request not found"}</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Request #{request.id}</h2>
      <div className="mb-4">
        <div><strong>Status:</strong> {request.status}</div>
        <div><strong>Reason:</strong> {request.requestReason}</div>
        <div><strong>Vehicle:</strong> {request.vehicleNumber} ({request.vehicleBrand} {request.vehicleModel})</div>
        <div><strong>Requester:</strong> {request.requesterName} ({request.requesterEmail})</div>
        <div><strong>Quantity:</strong> {request.quantity}</div>
        <div><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleString()}</div>
        {/* Add more fields as needed */}
      </div>
      <textarea
        className="w-full border rounded p-2 mb-4"
        placeholder="Enter notes..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => handleAction(true)}
        >
          Approve
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => handleAction(false)}
        >
          Reject
        </button>
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => navigate("/supervisor")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SupervisorRequestDetails;