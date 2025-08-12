import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import { Request } from "../types/request";
import { apiUrls } from "../config/api";

const SharedRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { fetchRequests } = useRequests();
  const { user } = useAuth();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await fetch(`${apiUrls.requests}/${numericId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch request details');
        }
        const data = await response.json();
        setRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [numericId]);

  const getStatusBadgeClass = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "supervisor approved": "bg-green-100 text-green-800 border-green-200",
      "technical-manager approved": "bg-blue-100 text-blue-800 border-blue-200",
      "engineer approved": "bg-purple-100 text-purple-800 border-purple-200",
      complete: "bg-emerald-100 text-emerald-800 border-emerald-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      default: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return statusClasses[status as keyof typeof statusClasses] || statusClasses.default;
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
            onClick={() => navigate(`/${user?.role}`)}
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
            onClick={() => navigate(`/${user?.role}`)}
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
            onClick={() => navigate(`/${user?.role}`)}
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
                {request.status.replace(/-/g, " ").replace(/(^\w|\s\w)/g, c => c.toUpperCase())}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-8">
          {/* Department Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Department Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  Brand
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.vehicleBrand}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Model
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.vehicleModel}
                </div>
              </div>
            </div>
          </div>

          {/* Tire Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tire Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="p-2 bg-gray-100 rounded">
                  {request.quantity}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tubes Quantity
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.tubesQuantity}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Last Replacement Date
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {new Date(request.lastReplacementDate).toLocaleDateString()}
                </div>
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
                  Present KM Reading
                </label>
                <div className="p-2 bg-gray-100 rounded">
                  {request.presentKmReading} km
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Request Details
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Request Reason
                </label>
                <div className="p-2 bg-gray-100 rounded whitespace-pre-wrap">
                  {request.requestReason}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Tire Wear Pattern
                </label>
                <div className="p-2 bg-gray-100 rounded whitespace-pre-wrap">
                  {request.tireWearPattern}
                </div>
              </div>
              {request.comments && (
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Additional Comments
                  </label>
                  <div className="p-2 bg-gray-100 rounded whitespace-pre-wrap">
                    {request.comments}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Attached Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {request.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setShowImageModal(true);
                    }}
                  >
                    <img
                      src={image}
                      alt={`Tire image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100">
                        Click to view
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Modal */}
          {showImageModal && request.images && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative max-w-4xl w-full mx-4">
                <button
                  className="absolute top-4 right-4 text-white hover:text-gray-300"
                  onClick={() => setShowImageModal(false)}
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
                <img
                  src={request.images[currentImageIndex]}
                  alt={`Tire image ${currentImageIndex + 1}`}
                  className="mx-auto max-h-[80vh] w-auto"
                />
                <div className="absolute z-20 px-4 py-2 text-sm font-medium text-white transform -translate-x-1/2 bg-black rounded-full bg-opacity-70 bottom-6 left-1/2">
                  {currentImageIndex + 1} of {request.images.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedRequestDetails;
