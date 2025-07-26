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

    // Required field validations
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

    // Numeric validations
    if (formData.quantity < 1) newErrors.quantity = "Quantity must be at least 1";
    if (formData.tubesQuantity < 0) newErrors.tubesQuantity = "Tubes quantity cannot be negative";
    if (formData.presentKmReading < 0) newErrors.presentKmReading = "Present KM reading cannot be negative";
    if (formData.previousKmReading < 0) newErrors.previousKmReading = "Previous KM reading cannot be negative";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.requesterEmail && !emailRegex.test(formData.requesterEmail)) {
      newErrors.requesterEmail = "Please enter a valid email address";
    }

    // KM reading logic validation
    if (formData.presentKmReading > 0 && formData.previousKmReading > 0 &&
        formData.presentKmReading <= formData.previousKmReading) {
      newErrors.presentKmReading = "Present KM reading should be greater than previous KM reading";
    }

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
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Tire Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Vehicle Information Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
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
          </div>

          {/* Quantity Information Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quantity & Tire Details</h3>
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
          </div>

          {/* Requester Information Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Requester Information</h3>
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
          </div>

          {/* Request Details Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Details</h3>
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
          </div>

          {/* Tire Details Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tire Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Replacement Date *
              </label>
              <input
                type="date"
                name="lastReplacementDate"
                value={formData.lastReplacementDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastReplacementDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.lastReplacementDate && (
                <p className="text-red-500 text-sm mt-1">{errors.lastReplacementDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Existing Tire Make *
              </label>
              <input
                type="text"
                name="existingTireMake"
                value={formData.existingTireMake}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.existingTireMake ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.existingTireMake && (
                <p className="text-red-500 text-sm mt-1">{errors.existingTireMake}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tire Wear Pattern *
              </label>
              <select
                name="tireWearPattern"
                value={formData.tireWearPattern}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tireWearPattern ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select wear pattern</option>
                <option value="Even wear">Even wear</option>
                <option value="Center wear">Center wear</option>
                <option value="Edge wear">Edge wear</option>
                <option value="Cupping">Cupping</option>
                <option value="Patchy wear">Patchy wear</option>
                <option value="Feathering">Feathering</option>
              </select>
              {errors.tireWearPattern && (
                <p className="text-red-500 text-sm mt-1">{errors.tireWearPattern}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Center *
              </label>
              <input
                type="text"
                name="costCenter"
                value={formData.costCenter}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.costCenter ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.costCenter && (
                <p className="text-red-500 text-sm mt-1">{errors.costCenter}</p>
              )}
            </div>
            </div>
          </div>

          {/* KM Readings Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Readings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Present KM Reading *
              </label>
              <input
                type="number"
                name="presentKmReading"
                value={formData.presentKmReading}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.presentKmReading ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.presentKmReading && (
                <p className="text-red-500 text-sm mt-1">{errors.presentKmReading}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous KM Reading *
              </label>
              <input
                type="number"
                name="previousKmReading"
                value={formData.previousKmReading}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.previousKmReading ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.previousKmReading && (
                <p className="text-red-500 text-sm mt-1">{errors.previousKmReading}</p>
              )}
            </div>
            </div>
          </div>

          {/* Delivery Information Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Office Name
                </label>
                <input
                  type="text"
                  name="deliveryOfficeName"
                  value={formData.deliveryOfficeName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Street Name
                </label>
                <input
                  type="text"
                  name="deliveryStreetName"
                  value={formData.deliveryStreetName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Town
                </label>
                <input
                  type="text"
                  name="deliveryTown"
                  value={formData.deliveryTown}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing and Warranty Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Warranty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Price
              </label>
              <input
                type="number"
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warranty Distance (KM)
              </label>
              <input
                type="number"
                name="warrantyDistance"
                value={formData.warrantyDistance}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>

            {/* Tire Wear Indicator */}
            <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="tireWearIndicatorAppeared"
              checked={formData.tireWearIndicatorAppeared}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Tire wear indicator appeared
            </label>
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information or special requirements..."
            />
          </div>
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
