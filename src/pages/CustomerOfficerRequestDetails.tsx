import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Request } from "../types/request";
import { apiUrls } from "../config/api";

const CustomerOfficerRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

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
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [numericId]);

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

  const zoomIn = () => setImageZoom((prev) => Math.min(prev + 0.5, 3));
  const zoomOut = () => setImageZoom((prev) => Math.max(prev - 0.5, 0.5));

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/customer-officer")}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-600">
            Request Not Found
          </h2>
          <button
            onClick={() => navigate("/customer-officer")}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="p-8 space-y-6 bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Request Details - #{request.id}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  request.status === "complete"
                    ? "bg-green-100 text-green-800"
                    : request.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : request.status === "supervisor approved"
                    ? "bg-blue-100 text-blue-800"
                    : request.status === "technical-manager approved"
                    ? "bg-purple-100 text-purple-800"
                    : request.status === "engineer approved"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {request.status === 'pending' ? 'Pending' : 
                 request.status === 'complete' ? 'Engineer Approved' : 
                 (request.status.charAt(0).toUpperCase() + request.status.slice(1))}
              </span>
            </div>
          </div>

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
                  Tire Brand
                </label>
                <div className="p-2 bg-white rounded">
                  {request.existingTireMake || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tire Size
                </label>
                <div className="p-2 bg-white rounded">{request.tireSize}</div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tire Condition
                </label>
                <div className="p-2 bg-white rounded">
                  {request.tireWearIndicatorAppeared !== undefined
                    ? request.tireWearIndicatorAppeared
                      ? "Wear indicator appeared"
                      : "Good condition"
                    : "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tire Wear Pattern
                </label>
                <div className="p-2 bg-white rounded">
                  {request.tireWearPattern || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Request Reason
                </label>
                <div className="p-2 bg-white rounded">
                  {request.requestReason || "N/A"}
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
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tubes Quantity
                </label>
                <div className="p-2 bg-white rounded">
                  {request.tubesQuantity || "N/A"}
                </div>
              </div>
            </div>
          </div>
          <hr />

          {/* Supplier Details */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Supplier Details
            </h3>
            <div className="grid grid-cols-1 gap-6 p-6 rounded-lg md:grid-cols-2 bg-gray-50">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Supplier Name
                </label>
                <div className="p-2 bg-white rounded">
                  {request.supplierName || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Supplier Phone
                </label>
                <div className="p-2 bg-white rounded">
                  {request.supplierPhone || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Supplier Email
                </label>
                <div className="p-2 bg-white rounded">
                  {request.supplierEmail || "N/A"}
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

          {/* Images Section */}
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

          {/* Notes Section */}
          <div className="space-y-4">
            {request.supervisor_notes && (
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Supervisor Notes
                </label>
                <div className="p-3 border border-blue-200 rounded bg-blue-50">
                  {request.supervisor_notes}
                </div>
              </div>
            )}

            {request.technical_manager_note && (
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Technical Manager Notes
                </label>
                <div className="p-3 border border-purple-200 rounded bg-purple-50">
                  {request.technical_manager_note}
                </div>
              </div>
            )}

            {request.engineer_note && (
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Engineer Notes
                </label>
                <div className="p-3 border border-green-200 rounded bg-green-50">
                  {request.engineer_note}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              className="px-6 py-2 transition bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => navigate("/customer-officer")}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && request?.images && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full h-full max-w-6xl max-h-full p-4">
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

            {/* Navigation arrows */}
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
        </div>
      )}
    </div>
  );
};

export default CustomerOfficerRequestDetails;
