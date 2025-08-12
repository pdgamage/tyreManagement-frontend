import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Request } from "../types/request";
import { apiUrls } from "../config/api";

interface LocationState {
  fromInquiry?: boolean;
  returnPath?: string;
}

export default function SharedRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const numericId = parseInt(id, 10);
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
      } catch (err: any) {
        setError(err.message || "Failed to load request");
      }
      setLoading(false);
    };
    fetchRequest();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-gray-600">Loading request details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-md text-red-600">
        <p className="font-semibold">Error: {error}</p>
      </div>
    </div>
  );

  if (!request) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-md text-red-600">
        <p className="font-semibold">Request not found.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Vehicle & Requester Info */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
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

          {/* Tire & Request Details */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
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
                  {request.tubesQuantity || 'N/A'}
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

          {/* Delivery & Pricing Information */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
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

          {/* Images Section */}
          {request.images && request.images.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Images
              </h3>
              <div className="flex flex-wrap gap-4 p-6 rounded-lg bg-gray-50">
                {request.images.map((img, idx) =>
                  img ? (
                    <img
                      key={idx}
                      src={img}
                      alt={`Tire image ${idx + 1}`}
                      className="object-cover w-32 h-32 transition-opacity border rounded cursor-pointer hover:opacity-80"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/128?text=Image+Not+Found";
                      }}
                    />
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => state?.returnPath ? navigate(state.returnPath) : navigate(-1)}
              className="px-6 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
