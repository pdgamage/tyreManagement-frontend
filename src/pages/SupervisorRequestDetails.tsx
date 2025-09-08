import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import { Request } from "../types/request";
import { apiUrls } from "../config/api";

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
  const [isRejecting, setIsRejecting] = useState(false);
  const [notesError, setNotesError] = useState("");
  const navigate = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
    setImageZoom(1); // Reset zoom
    setImagePan({ x: 0, y: 0 }); // Reset pan
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    const images = request?.images;
    if (!images?.length) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    setImageZoom(1); // Reset zoom
    setImagePan({ x: 0, y: 0 }); // Reset pan
  };

  const prevImage = () => {
    const images = request?.images;
    if (!images?.length) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setImageZoom(1); // Reset zoom
    setImagePan({ x: 0, y: 0 }); // Reset pan
  };

  const zoomIn = () => setImageZoom(zoom => Math.min(zoom + 0.2, 3));
  const zoomOut = () => setImageZoom(zoom => Math.max(zoom - 0.2, 0.5));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePan.x, y: e.clientY - imagePan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };


  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isNaN(numericId)) {
          throw new Error("Invalid request ID.");
        }
        const res = await fetch(apiUrls.requestById(numericId));
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Request not found.");
          }
          throw new Error("Failed to fetch request.");
        }
        const text = await res.text();
        console.log("SupervisorRequestDetails: Raw response from server:", text);
        let data;
        try {
          data = JSON.parse(text);
          setRequest(data);
        } catch (jsonError) {
          console.error("SupervisorRequestDetails: Failed to parse JSON:", jsonError);
          throw new Error("Invalid JSON response from server.");
        }
        // If not pending, set notes to supervisor_notes from backend
        if (data && data.status !== "pending" && data.supervisor_notes) {
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
      if (!id) return;
      await updateRequestStatus(
        id, // Pass the string id as required by the function signature
        approve ? "supervisor approved" : "supervisor rejected",
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
            {request.status === 'pending' ? 'Pending' : 
             request.status === 'complete' ? 'Engineer Approved' : 
             request.status.replace(/_/g, " ")}
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
                  {request.totalPrice?.toLocaleString() || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Selected Supplier
                </label>
                <div className="p-2 bg-white rounded">
                  {(request as any).selectedSupplier || "N/A"}
                </div>
              </div>
            </div>
          </div>
          <hr />

          {/* Attached Images */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Attached Images
            </h3>
            <div className="grid grid-cols-2 gap-4 p-6 rounded-lg md:grid-cols-4 bg-gray-50">
              {request.images && request.images.filter((img) => img).length > 0 ? (
                request.images
                  .filter((img) => img)
                  .map((image, index) => (
                    <div
                      key={index}
                      className="relative w-full h-48 overflow-hidden rounded-lg cursor-pointer group"
                      onClick={() => openImageModal(index)}
                    >
                      <img
                        src={image}
                        alt={`Request attachment ${index + 1}`}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100">
                        <span className="text-lg text-white">View</span>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="col-span-full">No images attached.</p>
              )}
            </div>
          </div>
          <hr />

          {/* Notes & Actions */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Notes & Actions
            </h3>
            <div className="p-6 rounded-lg bg-gray-50">
              <label className="block mb-2 font-semibold text-gray-700">
                Supervisor Notes
              </label>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                className={`w-full p-2 border rounded ${
                  notesError ? "border-red-500" : "border-gray-300"
                }`}
                rows={4}
                placeholder="Enter your notes here..."
                disabled={request.status !== "pending"}
              />
              {notesError && (
                <p className="mt-2 text-sm text-red-600">{notesError}</p>
              )}

              {request.status === "pending" && (
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    type="button"
                    onClick={() => handleAction(true)}
                    disabled={isApproving || isRejecting}
                    className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {isApproving ? "Approving..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectConfirm(true)}
                    disabled={isApproving || isRejecting}
                    className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>

        {/* Reject Confirmation Modal */}
        {showRejectConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-8 bg-white rounded-lg shadow-xl">
              <h3 className="mb-4 text-lg font-bold">Confirm Rejection</h3>
              <p>Are you sure you want to reject this request?</p>
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => setShowRejectConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowRejectConfirm(false);
                    handleAction(false);
                  }}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                  disabled={isRejecting}
                >
                  {isRejecting ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Image Modal */}
      {showImageModal && request?.images && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <div className="relative max-w-4xl max-h-full p-4">
            <button onClick={closeImageModal} className="absolute top-0 right-0 z-50 p-2 m-4 text-white bg-gray-800 rounded-full hover:bg-gray-700">&times;</button>
            
            {/* Image Controls */}
            <div className="absolute z-50 flex space-x-2 bottom-4 left-1/2 -translate-x-1/2">
                <button onClick={zoomIn} className="px-4 py-2 text-white bg-gray-800 rounded-lg">Zoom In</button>
                <button onClick={zoomOut} className="px-4 py-2 text-white bg-gray-800 rounded-lg">Zoom Out</button>
            </div>

            {/* Image Navigation */}
            {request.images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-0 z-50 p-4 text-white -translate-y-1/2 top-1/2">&#10094;</button>
                <button onClick={nextImage} className="absolute right-0 z-50 p-4 text-white -translate-y-1/2 top-1/2">&#10095;</button>
              </>
            )}

            <div className='overflow-hidden' onMouseUp={handleMouseUp}>
                <img
                    src={request.images[currentImageIndex]}
                    alt={`viewing attachment ${currentImageIndex + 1}`}
                    className={`transition-transform duration-200 ease-out ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{
                        transform: `scale(${imageZoom}) translate(${imagePan.x}px, ${imagePan.y}px)`,
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                    }}
                    onMouseDown={handleMouseDown}
                />
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {currentImageIndex + 1} / {request.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorRequestDetails;
