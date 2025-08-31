import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import { Request } from "../types/request";
import { apiUrls } from "../config/api";

const UserRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { fetchRequests } = useRequests();
  const { user } = useAuth();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editedRequest, setEditedRequest] = useState<Request | null>(null);
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
        setEditedRequest(data);
      } catch (err: any) {
        setError(err.message || "Failed to load request");
      }
      setLoading(false);
    };
    fetchRequest();
  }, [id]);

  const canEdit = () => {
    return (
      request?.status?.toLowerCase() === "pending" &&
      request?.requesterEmail === user?.email
    );
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!canEdit() || !editedRequest) return;

    setEditedRequest((prev) => ({
      ...prev!,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleUpdateRequest = async () => {
    if (!editedRequest || !hasChanges) return;

    setIsUpdating(true);
    try {
      const response = await fetch(apiUrls.requestById(editedRequest.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to update request");
      }

      await fetchRequests();
      setRequest(editedRequest);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update request:", error);
    } finally {
      setIsUpdating(false);
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
    setCurrentImageIndex(0);
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePan.x, y: e.clientY - imagePan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setImagePan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setImageZoom((prev) => Math.min(Math.max(prev * delta, 0.5), 3));
  };

  // Extra helper text for certain statuses (UI clarity)
  const getStatusExtraText = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') {
      return ' - user tire requested';
    }
    return '';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "supervisor approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "technical-manager approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "engineer approved":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "order placed":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "complete":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "order cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate("/user")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!request || !editedRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Request not found.</p>
          <button
            onClick={() => navigate("/user")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/user")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Request #{request.id}
              </h1>
              <p className="text-gray-600 mt-1">
                Submitted on{" "}
                {new Date(request.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(
                  request.status || ""
                )}`}
              >
                {request.status || "Unknown"}
                {getStatusExtraText(request.status || "")}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
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
                <div className="p-2 bg-gray-100 rounded">
                  {request.vehicleNumber}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Vehicle Brand
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.vehicleBrand}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Vehicle Model
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.vehicleModel}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Department/Section
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.userSection}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Cost Center
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.costCenter}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Requester Name
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.requesterName}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Requester Email
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.requesterEmail}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Requester Phone
                </label>
                {canEdit() ? (
                  <input
                    type="text"
                    value={editedRequest.requesterPhone}
                    onChange={(e) =>
                      handleFieldChange("requesterPhone", e.target.value)
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-white rounded">
                    {request.requesterPhone}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Submitted At
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {new Date(request.submittedAt).toLocaleString()}
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
                  Delivery Office
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.deliveryOfficeName || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Delivery Street
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.deliveryStreetName || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Delivery Town
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.deliveryTown || "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Total Price
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.totalPrice
                    ? `LKR ${request.totalPrice.toLocaleString()}`
                    : "N/A"}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Warranty Distance
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.warrantyDistance
                    ? `${request.warrantyDistance.toLocaleString()} KM`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

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
                <div className="p-2 bg-gray-100 rounded">
                  {request.tireSizeRequired}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Quantity
                </label>
                {canEdit() ? (
                  <input
                    type="number"
                    value={editedRequest.quantity}
                    onChange={(e) =>
                      handleFieldChange("quantity", parseInt(e.target.value))
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-white rounded">{request.quantity}</div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tubes Quantity
                </label>
                {canEdit() ? (
                  <input
                    type="number"
                    value={editedRequest.tubesQuantity}
                    onChange={(e) =>
                      handleFieldChange(
                        "tubesQuantity",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-white rounded">
                    {request.tubesQuantity}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Existing Tire Make
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.existingTireMake}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Last Replacement Date
                </label>
                {canEdit() ? (
                  <input
                    type="date"
                    value={
                      editedRequest.lastReplacementDate
                        ? typeof editedRequest.lastReplacementDate === "string"
                          ? editedRequest.lastReplacementDate.split("T")[0]
                          : new Date(editedRequest.lastReplacementDate)
                              .toISOString()
                              .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleFieldChange("lastReplacementDate", e.target.value)
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-white rounded">
                    {request.lastReplacementDate
                      ? new Date(
                          request.lastReplacementDate
                        ).toLocaleDateString()
                      : "-"}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Present KM Reading
                </label>
                {canEdit() ? (
                  <input
                    type="number"
                    value={editedRequest.presentKmReading}
                    onChange={(e) =>
                      handleFieldChange(
                        "presentKmReading",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-white rounded">
                    {request.presentKmReading}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Previous KM Reading
                </label>
                {canEdit() ? (
                  <input
                    type="number"
                    value={editedRequest.previousKmReading}
                    onChange={(e) =>
                      handleFieldChange(
                        "previousKmReading",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-white rounded">
                    {request.previousKmReading}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tire Wear Pattern
                </label>
                {canEdit() ? (
                  <input
                    type="text"
                    value={editedRequest.tireWearPattern}
                    onChange={(e) =>
                      handleFieldChange("tireWearPattern", e.target.value)
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-white rounded">
                    {request.tireWearPattern}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Request Reason
                </label>
                {canEdit() ? (
                  <input
                    type="text"
                    value={editedRequest.requestReason}
                    onChange={(e) =>
                      handleFieldChange("requestReason", e.target.value)
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-white rounded">
                    {request.requestReason}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold text-gray-700">
                  Comments
                </label>
                {canEdit() ? (
                  <textarea
                    value={editedRequest.comments || ""}
                    onChange={(e) =>
                      handleFieldChange("comments", e.target.value)
                    }
                    rows={3}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-white rounded">
                    {request.comments || "No comments"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                Attached Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-lg">
                {request.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => openImageModal(index)}
                  >
                    <img
                      src={image}
                      alt={`Request image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black bg-opacity-50 text-white p-2 rounded text-sm">
                        Click to view
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Button */}
          {canEdit() && hasChanges && (
            <div className="flex justify-start mt-8">
              <button
                onClick={handleUpdateRequest}
                disabled={isUpdating}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
              >
                {isUpdating ? "Updating..." : "Update Request"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && request.images && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 text-2xl"
            >
              ✕
            </button>
            <img
              src={request.images[currentImageIndex]}
              alt={`Request image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain cursor-move"
              style={{
                transform: `scale(${imageZoom}) translate(${imagePan.x}px, ${imagePan.y}px)`,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              draggable={false}
            />
            {request.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {request.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRequestDetails;
