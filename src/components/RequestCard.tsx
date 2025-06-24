import React from "react";
import { TireRequest } from "../contexts/RequestContext";

interface RequestCardProps {
  request: TireRequest;
}

const RequestCard = ({ request }: RequestCardProps) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-md">
      <div className="flex items-start justify-between pb-4 mb-6 border-b">
        <div>
          <h2 className="text-2xl font-bold">Tire Request Details</h2>
          <p className="text-gray-600">Request #{request.id}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              request.status.includes("approved")
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {request.status.replace(/_/g, " ")}
          </span>
          <p className="mt-1 text-sm text-gray-600">
            Submitted on: {formatDate(request.submittedAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Vehicle Information */}
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="pb-2 mb-3 text-lg font-semibold border-b">
            Vehicle Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Vehicle Number
              </p>
              <p>{request.vehicleNumber}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Vehicle Type
              </p>
              <p>{request.vehicleType}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Make/Model</p>
              <p>
                {request.vehicleBrand} {request.vehicleModel}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Current KM Reading
              </p>
              <p>{request.presentKmReading} km</p>
            </div>
          </div>
        </div>

        {/* Tire Request Details */}
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="pb-2 mb-3 text-lg font-semibold border-b">
            Tire Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-600">Tire Size</p>
              <p>{request.tireSize}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Quantity Requested
              </p>
              <p>{request.quantity} tires</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Tubes Requested
              </p>
              <p>{request.tubesQuantity || "None"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Last Replacement KM
              </p>
              <p>{request.previousKmReading} km</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Wear Pattern
              </p>
              <p>
                {request.tireWearPattern?.replace(/_/g, " ") || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Requester Information */}
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="pb-2 mb-3 text-lg font-semibold border-b">
            Requester Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-600">Name</p>
              <p>{request.requesterName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Section</p>
              <p>{request.userSection}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Contact</p>
              <p>
                {request.requesterPhone} / {request.requesterEmail}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Cost Center</p>
              <p>{request.costCenter}</p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="pb-2 mb-3 text-lg font-semibold border-b">
            Additional Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Request Reason
              </p>
              <p className="whitespace-pre-line">{request.requestReason}</p>
            </div>
            {request.notes && (
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Additional Notes
                </p>
                <p className="whitespace-pre-line">{request.notes}</p>
              </div>
            )}
            {request.images?.filter((img) => img).length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Attached Images
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {request.images.map(
                    (img, index) =>
                      img && (
                        <div key={index} className="p-1 border rounded">
                          <img
                            src={typeof img === "string" ? img : ""}
                            alt={`Tire condition ${index + 1}`}
                            className="object-cover w-full h-24"
                          />
                          <p className="mt-1 text-xs text-center">
                            Image {index + 1}
                          </p>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
