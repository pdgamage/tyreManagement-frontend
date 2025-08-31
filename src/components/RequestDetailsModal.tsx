import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import type { TireRequest } from '../types/api';

interface RequestDetailsModalProps {
  request: TireRequest | null;
  onClose: () => void;
  isOpen: boolean;
}

const getStatusBadgeClass = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'complete':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'supervisor approved':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'technical-manager approved':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'engineer approved':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleString();
};

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ request, onClose, isOpen }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Request Details #{request.id}
              </h3>
              <div className={`inline-flex items-center px-3 py-1 mt-2 text-sm font-medium rounded-full border ${getStatusBadgeClass(request.status || '')}`}>
                {request.status === 'pending' ? 'User Requested tire' : 
                 request.status === 'complete' ? 'Engineer Approved' : 
                 (request.status || 'Unknown')}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Request Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Request Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">ID:</span> {request.id}</p>
                  <p><span className="font-medium">Status:</span> {request.status === 'pending' ? 'User Requested tire' : request.status === 'complete' ? 'Engineer Approved' : (request.status || '-')}</p>
                  <p><span className="font-medium">Submitted:</span> {formatDate(request.submittedAt)}</p>
                  <p><span className="font-medium">Reason:</span> {request.requestReason}</p>
                  <p><span className="font-medium">Comments:</span> {request.comments || 'N/A'}</p>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Vehicle ID:</span> {request.vehicleId}</p>
                  <p><span className="font-medium">Number:</span> {request.vehicleNumber}</p>
                  <p><span className="font-medium">Brand:</span> {request.vehicleBrand}</p>
                  <p><span className="font-medium">Model:</span> {request.vehicleModel}</p>
                  <p><span className="font-medium">Department/Section:</span> {request.userSection}</p>
                  <p><span className="font-medium">Cost Center:</span> {request.costCenter}</p>
                </div>
              </div>

              {/* Tire Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Tire Details</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Size Required:</span> {request.tireSizeRequired}</p>
                  <p><span className="font-medium">Quantity:</span> {request.quantity}</p>
                  <p><span className="font-medium">Tubes Quantity:</span> {request.tubesQuantity}</p>
                  <p><span className="font-medium">Current Make:</span> {request.existingTireMake}</p>
                  <p><span className="font-medium">Last Replacement:</span> {formatDate(request.lastReplacementDate)}</p>
                  <p><span className="font-medium">Current KM:</span> {request.presentKmReading.toLocaleString()}</p>
                  <p><span className="font-medium">Previous KM:</span> {request.previousKmReading.toLocaleString()}</p>
                  <p><span className="font-medium">KM Difference:</span> {(request.presentKmReading - request.previousKmReading).toLocaleString()}</p>
                  <p><span className="font-medium">Wear Pattern:</span> {request.tireWearPattern}</p>
                </div>
              </div>

              {/* Requester Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Requester Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {request.requesterName}</p>
                  <p><span className="font-medium">Email:</span> {request.requesterEmail}</p>
                  <p><span className="font-medium">Phone:</span> {request.requesterPhone}</p>
                </div>
              </div>

              {/* Delivery & Pricing Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Delivery & Pricing Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Delivery Office:</span> {request.deliveryOfficeName || "N/A"}</p>
                  <p><span className="font-medium">Delivery Street:</span> {request.deliveryStreetName || "N/A"}</p>
                  <p><span className="font-medium">Delivery Town:</span> {request.deliveryTown || "N/A"}</p>
                  <p><span className="font-medium">Total Price:</span> {request.totalPrice ? `LKR ${Number(request.totalPrice).toLocaleString()}` : "N/A"}</p>
                  <p><span className="font-medium">Warranty Distance:</span> {request.warrantyDistance ? `${Number(request.warrantyDistance).toLocaleString()} KM` : "N/A"}</p>
                  <p><span className="font-medium">Tire Wear Indicator:</span> {request.tireWearIndicatorAppeared !== undefined ? (request.tireWearIndicatorAppeared ? "Yes" : "No") : "N/A"}</p>
                </div>
              </div>

              {/* Order Receipt - Only show for placed orders */}
              {request.status === 'order placed' && (
                <div className="col-span-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-green-700 border-b border-green-200 pb-2">
                      Order Receipt
                    </h4>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-2">Official Order Receipt</h5>
                        <p className="text-sm text-gray-600">Order Number: {request.orderNumber}</p>
                        <p className="text-sm text-gray-600">Date: {formatDate(request.orderPlacedDate)}</p>
                      </div>
                    </div>
                    <div className="border-t border-green-200 pt-4 mt-4">
                      <h6 className="text-sm font-medium text-gray-900 mb-2">Receipt Summary</h6>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Vehicle: {request.vehicleNumber}</p>
                          <p className="text-sm text-gray-600">Department: {request.userSection}</p>
                          <p className="text-sm text-gray-600">Cost Center: {request.costCenter}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tire Size: {request.tireSize}</p>
                          <p className="text-sm text-gray-600">Quantity: {request.quantity}</p>
                          <p className="text-sm font-medium text-gray-900">Total: LKR {Number(request.totalPrice).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Information - Only show for cancelled orders */}
              {request.status === 'order cancelled' && request.customer_officer_note && (
                <div className="col-span-full space-y-4">
                  <h4 className="text-lg font-semibold text-orange-700 border-b border-orange-200 pb-2">Cancellation Information</h4>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-600 font-medium mb-2">Reason for Cancellation:</p>
                    <p className="text-gray-800">{request.customer_officer_note}</p>
                  </div>
                </div>
              )}

              {/* Images Section */}
              {request.images && request.images.length > 0 && (
                <div className="col-span-full space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Tire Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {request.images.map((image, index) => {
                      if (!image || image instanceof File) return null;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(image)}
                          className="relative aspect-square group rounded-lg overflow-hidden border hover:border-blue-500 focus:outline-none"
                        >
                          <img
                            src={image}
                            alt={`Tire image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged tire image"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestDetailsModal;