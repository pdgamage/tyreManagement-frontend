import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import { Request } from "../types/request";

const SupervisorRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { updateRequestStatus, fetchRequests } = useRequests();
  const { user } = useAuth();
  const [request, setRequest] = useState<Request | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRejecting, setIsRejecting] = useState(false);
  const [notesError, setNotesError] = useState("");
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
    // Clear previous error
    setNotesError("");

    // Validate notes
    if (!notes.trim()) {
      setNotesError("Please enter notes before proceeding");
      return;
    }

    if (notes.trim().length < 10) {
      setNotesError("Notes must be at least 10 characters long");
      return;
    }

    // Set appropriate loading state
    if (approve) {
      setIsApproving(true);
    } else {
      setIsRejecting(true);
    }

    try {
      await updateRequestStatus(
        id!,
        approve ? "supervisor approved" : "rejected",
        notes,
        "supervisor",
        user?.id
      );
      await fetchRequests();
      navigate("/supervisor");
    } catch {
      alert("Failed to update request status");
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  // Image modal functions
  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (request?.images) {
      const validImages = request.images.filter((img) => img);
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
    }
  };

  const prevImage = () => {
    if (request?.images) {
      const validImages = request.images.filter((img) => img);
      setCurrentImageIndex(
        (prev) => (prev - 1 + validImages.length) % validImages.length
      );
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
    }
  };

  const zoomIn = () => {
    setImageZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setImageZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  // Mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePan.x, y: e.clientY - imagePan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      setImagePan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    // Clear error when user starts typing
    if (notesError) {
      setNotesError("");
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
        <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-blue-700">
          <span>Request {request.id}</span>
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

          {/* Delivery & Pricing Information */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Delivery & Pricing Information
            </h3>
            <div className="grid grid-cols-1 gap-6 p-6 rounded-lg md:grid-cols-2 bg-gray-50">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Delivery Office Name
                </label>
                <div className="p-2 bg-white rounded">
                  {request.deliveryOfficeName || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Delivery Street Name
                </label>
                <div className="p-2 bg-white rounded">
                  {request.deliveryStreetName || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Delivery Town
                </label>
                <div className="p-2 bg-white rounded">
                  {request.deliveryTown || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Total Price (LKR)
                </label>
                <div className="p-2 bg-white rounded">
                  {request.totalPrice
                    ? `LKR ${Number(request.totalPrice).toLocaleString()}`
                    : "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Warranty Distance (KM)
                </label>
                <div className="p-2 bg-white rounded">
                  {request.warrantyDistance
                    ? `${Number(request.warrantyDistance).toLocaleString()} KM`
                    : "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tire Wear Indicator Appeared
                </label>
                <div className="p-2 bg-white rounded">
                  {request.tireWearIndicatorAppeared !== undefined
                    ? request.tireWearIndicatorAppeared
                      ? "Yes"
                      : "No"
                    : "N/A"}
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
                      className="object-cover w-24 h-24 transition-opacity border rounded cursor-pointer hover:opacity-80"
                      onClick={() => openImageModal(idx)}
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
              Supervisor Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full p-2 mt-1 border rounded ${
                notesError
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter notes (minimum 10 characters)..."
              value={notes}
              onChange={handleNotesChange}
              rows={3}
              readOnly={request.status !== "pending"} // Make read-only if not pending
            />
            {notesError && (
              <p className="mt-1 text-sm text-red-600">{notesError}</p>
            )}
            {request.status === "pending" && (
              <p className="mt-1 text-sm text-gray-500">
                Please provide detailed notes for your decision (minimum 10
                characters)
              </p>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            {request.status === "pending" && (
              <>
                <button
                  type="button"
                  className="px-6 py-2 text-white transition bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleAction(true)}
                  disabled={isApproving || isRejecting}
                >
                  {isApproving ? "Approving..." : "Approve"}
                </button>
                <button
                  type="button"
                  className="px-6 py-2 text-white transition bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowRejectConfirm(true)}
                  disabled={isApproving || isRejecting}
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
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowRejectConfirm(false)}
                  disabled={isRejecting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setShowRejectConfirm(false);
                    handleAction(false);
                  }}
                  disabled={isRejecting}
                >
                  {isRejecting ? "Rejecting..." : "Yes, Reject"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && request?.images && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute z-20 p-3 text-white transition-all bg-black rounded-full bg-opacity-70 top-4 right-4 hover:bg-opacity-90"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Zoom controls */}
            <div className="absolute z-20 flex gap-2 top-4 left-4">
              <button
                onClick={zoomOut}
                className="p-3 text-white transition-all bg-black rounded-full bg-opacity-70 hover:bg-opacity-90"
                title="Zoom Out"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="px-4 py-3 text-sm font-medium text-white bg-black rounded-full bg-opacity-70">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-3 text-white transition-all bg-black rounded-full bg-opacity-70 hover:bg-opacity-90"
                title="Zoom In"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation arrows - Always visible with higher z-index */}
            {request.images.filter((img) => img).length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute z-30 p-4 text-white transition-all transform -translate-y-1/2 bg-black rounded-full bg-opacity-70 left-6 top-1/2 hover:bg-opacity-90 hover:scale-110"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute z-30 p-4 text-white transition-all transform -translate-y-1/2 bg-black rounded-full bg-opacity-70 right-6 top-1/2 hover:bg-opacity-90 hover:scale-110"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image container */}
            <div
              className="flex items-center justify-center w-full h-full overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                cursor:
                  imageZoom > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
              }}
            >
              <img
                src={request.images.filter((img) => img)[currentImageIndex]}
                alt={`Tire image ${currentImageIndex + 1}`}
                className="object-contain max-w-full max-h-full transition-transform duration-200 select-none"
                style={{
                  transform: `scale(${imageZoom}) translate(${
                    imagePan.x / imageZoom
                  }px, ${imagePan.y / imageZoom}px)`,
                  transformOrigin: "center center",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/800x600?text=Image+Not+Found";
                }}
                draggable={false}
              />
            </div>

            {/* Image counter */}
            <div className="absolute z-20 px-4 py-2 text-sm font-medium text-white transform -translate-x-1/2 bg-black rounded-full bg-opacity-70 bottom-6 left-1/2">
              {currentImageIndex + 1} of{" "}
              {request.images.filter((img) => img).length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorRequestDetails;
