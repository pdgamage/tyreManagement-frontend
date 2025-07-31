import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import { Request } from "../types/request";
import { apiUrls } from "../config/api";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Car, 
  FileText, 
  MessageSquare, 
  Edit3,
  ZoomIn,
  X
} from "lucide-react";

const UserRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchRequests } = useRequests();
  
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });

  const numericId = parseInt(id || "0", 10);

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
    setCurrentImageIndex(0);
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const handleEditRequest = () => {
    navigate(`/user/edit-request/${id}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEditRequest = () => {
    return request?.status?.toLowerCase() === "pending";
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

  if (!request) {
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/user")}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Request #{request.id}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(request.status || '')}`}>
                {request.status || 'Unknown'}
              </div>
              {canEditRequest() && (
                <button
                  onClick={handleEditRequest}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Request Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Request Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request ID</label>
                  <p className="mt-1 text-sm text-gray-900">#{request.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(request.submittedAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request Reason</label>
                  <p className="mt-1 text-sm text-gray-900">{request.requestReason}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(request.status || '')}`}>
                    {request.status || 'Unknown'}
                  </div>
                </div>
              </div>
              {request.comments && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Comments</label>
                  <p className="mt-1 text-sm text-gray-900">{request.comments}</p>
                </div>
              )}
            </div>

            {/* Vehicle Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Vehicle Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                  <p className="mt-1 text-sm text-gray-900">{request.vehicleNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Mileage</label>
                  <p className="mt-1 text-sm text-gray-900">{request.currentMileage?.toLocaleString()} km</p>
                </div>
              </div>
            </div>

            {/* Tire Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tire Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tire Size Required</label>
                  <p className="mt-1 text-sm text-gray-900">{request.tireSizeRequired}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Existing Tire Make</label>
                  <p className="mt-1 text-sm text-gray-900">{request.existingTireMake || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Price</label>
                  <p className="mt-1 text-sm text-gray-900">Rs. {request.totalPrice?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Warranty Distance</label>
                  <p className="mt-1 text-sm text-gray-900">{request.warrantyDistance?.toLocaleString()} km</p>
                </div>
              </div>
            </div>

            {/* Images */}
            {request.images && request.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Attached Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {request.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Request image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => openImageModal(index)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Submitted By
              </h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">{request.userName}</p>
                <p className="text-sm text-gray-600">{request.userEmail}</p>
                <p className="text-sm text-gray-600">{request.userDepartment}</p>
              </div>
            </div>

            {/* Status Notes */}
            {(request.supervisor_notes || request.engineer_note || request.technical_manager_notes) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Status Notes
                </h2>
                <div className="space-y-4">
                  {request.supervisor_notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Supervisor Notes</h3>
                      <p className="mt-1 text-sm text-gray-900">{request.supervisor_notes}</p>
                    </div>
                  )}
                  {request.engineer_note && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Engineer Notes</h3>
                      <p className="mt-1 text-sm text-gray-900">{request.engineer_note}</p>
                    </div>
                  )}
                  {request.technical_manager_notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Technical Manager Notes</h3>
                      <p className="mt-1 text-sm text-gray-900">{request.technical_manager_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Edit Notice */}
            {!canEditRequest() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Request Cannot Be Edited
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This request can only be edited when the status is "Pending". 
                        Current status: {request.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && request.images && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={request.images[currentImageIndex]}
              alt={`Request image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${imageZoom}) translate(${imagePan.x}px, ${imagePan.y}px)`,
              }}
            />
            {request.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {request.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
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
