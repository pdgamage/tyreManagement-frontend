import React, { useState, useEffect } from "react";
import { X, Save, Loader } from "lucide-react";
import { Request } from "../types/request";
import { useAuth } from "../contexts/AuthContext";
import { useRequests } from "../contexts/RequestContext";

interface EditRequestModalProps {
  request: Request | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditFormData {
  vehicleNumber: string;
  quantity: number;
  tubesQuantity: number;
  tireSize: string;
  requestReason: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  vehicleBrand: string;
  vehicleModel: string;
  lastReplacementDate: string;
  existingTireMake: string;
  tireSizeRequired: string;
  presentKmReading: number;
  previousKmReading: number;
  tireWearPattern: string;
  comments: string;
  userSection: string;
  costCenter: string;
  deliveryOfficeName: string;
  deliveryStreetName: string;
  deliveryTown: string;
  totalPrice: number;
  warrantyDistance: number;
  tireWearIndicatorAppeared: boolean;
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { fetchRequests } = useRequests();
  const [formData, setFormData] = useState<EditFormData>({
    vehicleNumber: "",
    quantity: 1,
    tubesQuantity: 0,
    tireSize: "",
    requestReason: "",
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    vehicleBrand: "",
    vehicleModel: "",
    lastReplacementDate: "",
    existingTireMake: "",
    tireSizeRequired: "",
    presentKmReading: 0,
    previousKmReading: 0,
    tireWearPattern: "",
    comments: "",
    userSection: "",
    costCenter: "",
    deliveryOfficeName: "",
    deliveryStreetName: "",
    deliveryTown: "",
    totalPrice: 0,
    warrantyDistance: 0,
    tireWearIndicatorAppeared: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form data when request changes
  useEffect(() => {
    if (request) {
      setFormData({
        vehicleNumber: request.vehicleNumber || "",
        quantity: request.quantity || 1,
        tubesQuantity: request.tubesQuantity || 0,
        tireSize: request.tireSize || "",
        requestReason: request.requestReason || "",
        requesterName: request.requesterName || "",
        requesterEmail: request.requesterEmail || "",
        requesterPhone: request.requesterPhone || "",
        vehicleBrand: request.vehicleBrand || "",
        vehicleModel: request.vehicleModel || "",
        lastReplacementDate: request.lastReplacementDate 
          ? new Date(request.lastReplacementDate).toISOString().split('T')[0] 
          : "",
        existingTireMake: request.existingTireMake || "",
        tireSizeRequired: request.tireSizeRequired || "",
        presentKmReading: request.presentKmReading || 0,
        previousKmReading: request.previousKmReading || 0,
        tireWearPattern: request.tireWearPattern || "",
        comments: request.comments || "",
        userSection: request.userSection || "",
        costCenter: request.costCenter || "",
        deliveryOfficeName: request.deliveryOfficeName || "",
        deliveryStreetName: request.deliveryStreetName || "",
        deliveryTown: request.deliveryTown || "",
        totalPrice: request.totalPrice || 0,
        warrantyDistance: request.warrantyDistance || 0,
        tireWearIndicatorAppeared: request.tireWearIndicatorAppeared || false,
      });
    }
  }, [request]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
              : type === 'number' ? Number(value) 
              : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = "Vehicle number is required";
    if (!formData.requestReason.trim()) newErrors.requestReason = "Request reason is required";
    if (!formData.requesterName.trim()) newErrors.requesterName = "Requester name is required";
    if (!formData.requesterEmail.trim()) newErrors.requesterEmail = "Email is required";
    if (!formData.requesterPhone.trim()) newErrors.requesterPhone = "Phone is required";
    if (!formData.vehicleBrand.trim()) newErrors.vehicleBrand = "Vehicle brand is required";
    if (!formData.vehicleModel.trim()) newErrors.vehicleModel = "Vehicle model is required";
    if (!formData.lastReplacementDate) newErrors.lastReplacementDate = "Last replacement date is required";
    if (!formData.existingTireMake.trim()) newErrors.existingTireMake = "Existing tire make is required";
    if (!formData.tireSizeRequired.trim()) newErrors.tireSizeRequired = "Tire size is required";
    if (!formData.tireWearPattern.trim()) newErrors.tireWearPattern = "Tire wear pattern is required";
    if (!formData.userSection.trim()) newErrors.userSection = "Department is required";
    if (!formData.costCenter.trim()) newErrors.costCenter = "Cost center is required";

    if (formData.quantity < 1) newErrors.quantity = "Quantity must be at least 1";
    if (formData.tubesQuantity < 0) newErrors.tubesQuantity = "Tubes quantity cannot be negative";
    if (formData.presentKmReading < 0) newErrors.presentKmReading = "Present KM reading cannot be negative";
    if (formData.previousKmReading < 0) newErrors.previousKmReading = "Previous KM reading cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !request) return;

    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tyremanagement-backend-production.up.railway.app";
      
      const response = await fetch(`${API_BASE_URL}/api/requests/${request.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchRequests(); // Refresh the requests list
        onSuccess?.();
        onClose();
      } else {
        const errorData = await response.json();
        console.error("Failed to update request:", errorData);
        alert("Failed to update request. Please try again.");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      alert("An error occurred while updating the request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Tire Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number *
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.vehicleNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Brand *
              </label>
              <input
                type="text"
                name="vehicleBrand"
                value={formData.vehicleBrand}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleBrand ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.vehicleBrand && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleBrand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Model *
              </label>
              <input
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleModel ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.vehicleModel && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleModel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tire Size Required *
              </label>
              <input
                type="text"
                name="tireSizeRequired"
                value={formData.tireSizeRequired}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tireSizeRequired ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.tireSizeRequired && (
                <p className="text-red-500 text-sm mt-1">{errors.tireSizeRequired}</p>
              )}
            </div>
          </div>

          {/* Quantity Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tubes Quantity
              </label>
              <input
                type="number"
                name="tubesQuantity"
                value={formData.tubesQuantity}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tubesQuantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tubesQuantity && (
                <p className="text-red-500 text-sm mt-1">{errors.tubesQuantity}</p>
              )}
            </div>
          </div>

          {/* Requester Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requester Name *
              </label>
              <input
                type="text"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.requesterName ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.requesterName && (
                <p className="text-red-500 text-sm mt-1">{errors.requesterName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="requesterEmail"
                value={formData.requesterEmail}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.requesterEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.requesterEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.requesterEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="requesterPhone"
                value={formData.requesterPhone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.requesterPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.requesterPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.requesterPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                name="userSection"
                value={formData.userSection}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.userSection ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.userSection && (
                <p className="text-red-500 text-sm mt-1">{errors.userSection}</p>
              )}
            </div>
          </div>

          {/* Request Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Reason *
            </label>
            <textarea
              name="requestReason"
              value={formData.requestReason}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.requestReason ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.requestReason && (
              <p className="text-red-500 text-sm mt-1">{errors.requestReason}</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Comments
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequestModal;
