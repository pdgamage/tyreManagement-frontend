import React, { useState, useEffect } from "react";
import { useVehicles } from "../contexts/VehicleContext";
import { useAuth } from "../contexts/AuthContext";
import { useRequests } from "../contexts/RequestContext";
import { useNavigate } from "react-router-dom";
import Autosuggest from "react-autosuggest";
import { Vehicle, TireDetails, TireRequest } from "../types/api";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://tyremanagement-backend-production.up.railway.app";

interface EditRequestFormProps {
  request: TireRequest;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface TireFormData {
  vehicleNumber: string;
  vehicleId: string;
  vehicleBrand: string;
  vehicleModel: string;
  tireSizeRequired: string;
  tireSize?: string;
  quantity: number;
  tubesQuantity: number;
  requestReason: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  userSection: string;
  lastReplacementDate: string;
  existingTireMake: string;
  costCenter: string;
  presentKmReading: string;
  previousKmReading: string;
  tireWearPattern: string;
  comments: string;
  images: (File | string | null)[];
  userId?: number;
  supervisorId: string;
  deliveryOfficeName: string;
  deliveryStreetName: string;
  deliveryTown: string;
  totalPrice: string;
  warrantyDistance: string;
  tireWearIndicatorAppeared: boolean;
}

const EditRequestForm: React.FC<EditRequestFormProps> = ({ 
  request, 
  onSuccess, 
  onCancel 
}) => {
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { user } = useAuth();
  const { fetchRequests } = useRequests();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<TireFormData>({
    vehicleNumber: request.vehicleNumber || "",
    vehicleId: request.vehicleId?.toString() || "",
    vehicleBrand: request.vehicleBrand || "",
    vehicleModel: request.vehicleModel || "",
    tireSizeRequired: request.tireSizeRequired || "",
    tireSize: request.tireSize || "",
    quantity: request.quantity || 1,
    tubesQuantity: request.tubesQuantity || 0,
    requestReason: request.requestReason || "",
    requesterName: request.requesterName || "",
    requesterEmail: request.requesterEmail || "",
    requesterPhone: request.requesterPhone || "",
    userSection: request.vehicleDepartment || "",
    lastReplacementDate: request.lastReplacementDate || "",
    existingTireMake: request.existingTireMake || "",
    costCenter: request.vehicleCostCentre || "",
    presentKmReading: request.presentKmReading?.toString() || "",
    previousKmReading: request.previousKmReading?.toString() || "",
    tireWearPattern: request.tireWearPattern || "",
    comments: request.comments || "",
    images: request.images ? [...request.images, ...Array(7 - request.images.length).fill(null)] : Array(7).fill(null),
    userId: request.userId || user?.id,
    supervisorId: "",
    deliveryOfficeName: "",
    deliveryStreetName: "",
    deliveryTown: "",
    totalPrice: "",
    warrantyDistance: "",
    tireWearIndicatorAppeared: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [vehicleSuggestions, setVehicleSuggestions] = useState<Vehicle[]>([]);
  const [tireSizes, setTireSizes] = useState<string[]>([]);
  const [tireSizeSuggestions, setTireSizeSuggestions] = useState<string[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);

  // Load tire sizes and supervisors on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load tire sizes
        const tireSizeResponse = await fetch(`${API_BASE_URL}/api/tire-details/sizes`);
        if (tireSizeResponse.ok) {
          const tireSizeData = await tireSizeResponse.json();
          setTireSizes(tireSizeData);
        }

        // Load supervisors
        setSupervisorsLoading(true);
        const supervisorResponse = await fetch(`${API_BASE_URL}/api/users/supervisors`);
        if (supervisorResponse.ok) {
          const supervisorData = await supervisorResponse.json();
          setSupervisors(supervisorData);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setSupervisorsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Auto-fill user information when component mounts
  useEffect(() => {
    if (user && !formData.requesterName) {
      setFormData(prev => ({
        ...prev,
        requesterName: user.name || "",
        requesterEmail: user.email || "",
        userId: parseInt(user.id) || undefined,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setFormData(prev => ({
      ...prev,
      vehicleNumber: vehicle.vehicleNumber,
      vehicleId: vehicle.id.toString(),
      vehicleBrand: vehicle.make || "",
      vehicleModel: vehicle.model || "",
      userSection: vehicle.department || "",
      costCenter: vehicle.costCentre || "",
    }));
  };

  const handleTireSizeSelect = (tireSize: string) => {
    setFormData(prev => ({
      ...prev,
      tireSizeRequired: tireSize,
      tireSize: tireSize,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [`image_${index}`]: "Image size must be less than 5MB"
      }));
      return;
    }

    // Clear any previous error for this image
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`image_${index}`];
      return newErrors;
    });

    try {
      const imageUrl = await uploadToCloudinary(file);
      const newImages = [...formData.images];
      newImages[index] = imageUrl;
      setFormData(prev => ({ ...prev, images: newImages }));
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrors(prev => ({
        ...prev,
        [`image_${index}`]: "Failed to upload image. Please try again."
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Required field validation
    const requiredFields = [
      { field: "vehicleNumber", label: "Vehicle Number" },
      { field: "vehicleId", label: "Vehicle ID" },
      { field: "vehicleBrand", label: "Vehicle Brand" },
      { field: "vehicleModel", label: "Vehicle Model" },
      { field: "tireSizeRequired", label: "Tire Size Required" },
      { field: "quantity", label: "Quantity" },
      { field: "tubesQuantity", label: "Tubes Quantity" },
      { field: "requestReason", label: "Request Reason" },
      { field: "requesterName", label: "Requester Name" },
      { field: "requesterEmail", label: "Requester Email" },
      { field: "requesterPhone", label: "Requester Phone" },
      { field: "userSection", label: "User Section" },
      { field: "lastReplacementDate", label: "Last Replacement Date" },
      { field: "existingTireMake", label: "Existing Tire Make" },
      { field: "costCenter", label: "Cost Center" },
      { field: "presentKmReading", label: "Present KM Reading" },
      { field: "previousKmReading", label: "Previous KM Reading" },
      { field: "tireWearPattern", label: "Tire Wear Pattern" },
    ];

    requiredFields.forEach(({ field, label }) => {
      if (!formData[field as keyof TireFormData] || formData[field as keyof TireFormData] === "") {
        newErrors[field] = `${label} is required`;
      }
    });

    // Email validation
    if (formData.requesterEmail && !/\S+@\S+\.\S+/.test(formData.requesterEmail)) {
      newErrors.requesterEmail = "Please enter a valid email address";
    }

    // Phone validation
    if (formData.requesterPhone) {
      const phoneDigits = formData.requesterPhone.replace(/\D/g, '');
      if (phoneDigits.length > 10) {
        newErrors.requesterPhone = "Phone number cannot exceed 10 digits";
      }
      if (phoneDigits.startsWith('0')) {
        newErrors.requesterPhone = "Phone number cannot start with zero";
      }
    }

    // Numeric field validation
    if (formData.quantity && (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 1)) {
      newErrors.quantity = "Quantity must be a positive number";
    }

    if (formData.tubesQuantity && isNaN(Number(formData.tubesQuantity))) {
      newErrors.tubesQuantity = "Tubes quantity must be a number";
    }

    if (formData.presentKmReading && isNaN(Number(formData.presentKmReading))) {
      newErrors.presentKmReading = "Present KM reading must be a number";
    }

    if (formData.previousKmReading && isNaN(Number(formData.previousKmReading))) {
      newErrors.previousKmReading = "Previous KM reading must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to update a tire request.");
      return;
    }

    if (!validateForm()) {
      setError("Please fix the errors above before submitting.");
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        userId: parseInt(user.id),
        vehicleId: parseInt(formData.vehicleId),
        quantity: parseInt(formData.quantity.toString()),
        tubesQuantity: parseInt(formData.tubesQuantity.toString()),
        presentKmReading: parseInt(formData.presentKmReading),
        previousKmReading: parseInt(formData.previousKmReading),
        images: formData.images.filter(img => img !== null),
      };

      const response = await fetch(`${API_BASE_URL}/api/requests/${request.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update request");
      }

      setSuccess(true);
      await fetchRequests();
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/user");
      }
    } catch (err: any) {
      console.error("Error updating request:", err);
      setError(err.message || "Failed to update tire request. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center bg-green-50 rounded-lg">
        <div className="text-green-600 text-lg font-semibold mb-2">
          Request Updated Successfully!
        </div>
        <p className="text-gray-600 mb-4">
          Your tire request has been updated and is now pending approval.
        </p>
        <button
          onClick={() => onCancel ? onCancel() : navigate("/user")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Edit Tire Request</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Vehicle Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vehicleNumber" className="block mb-1 font-medium text-gray-700">
                Vehicle Number *
              </label>
              <Autosuggest
                suggestions={vehicleSuggestions}
                onSuggestionsFetchRequested={({ value }) => {
                  const filteredVehicles = vehicles.filter(vehicle =>
                    vehicle.vehicleNumber.toLowerCase().includes(value.toLowerCase())
                  );
                  setVehicleSuggestions(filteredVehicles);
                }}
                onSuggestionsClearRequested={() => setVehicleSuggestions([])}
                getSuggestionValue={(vehicle: Vehicle) => vehicle.vehicleNumber}
                renderSuggestion={(vehicle: Vehicle) => (
                  <div className="p-2 hover:bg-gray-100 cursor-pointer">
                    <div className="font-medium">{vehicle.vehicleNumber}</div>
                    <div className="text-sm text-gray-600">
                      {vehicle.make} {vehicle.model} - {vehicle.department}
                    </div>
                  </div>
                )}
                onSuggestionSelected={(_, { suggestion }) => handleVehicleSelect(suggestion)}
                inputProps={{
                  value: formData.vehicleNumber,
                  onChange: (_, { newValue }) => {
                    setFormData(prev => ({ ...prev, vehicleNumber: newValue }));
                  },
                  className: `w-full p-3 border rounded ${errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'}`,
                  placeholder: "Enter or select vehicle number"
                }}
                theme={{
                  container: 'relative',
                  suggestionsContainer: 'absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto',
                  suggestionsList: 'list-none p-0 m-0',
                }}
              />
              {errors.vehicleNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="vehicleBrand" className="block mb-1 font-medium text-gray-700">
                Vehicle Brand *
              </label>
              <input
                type="text"
                id="vehicleBrand"
                name="vehicleBrand"
                value={formData.vehicleBrand}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.vehicleBrand ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter vehicle brand"
              />
              {errors.vehicleBrand && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleBrand}</p>
              )}
            </div>
          </div>
        </div>

            <div>
              <label htmlFor="vehicleModel" className="block mb-1 font-medium text-gray-700">
                Vehicle Model *
              </label>
              <input
                type="text"
                id="vehicleModel"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.vehicleModel ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter vehicle model"
              />
              {errors.vehicleModel && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleModel}</p>
              )}
            </div>

            <div>
              <label htmlFor="userSection" className="block mb-1 font-medium text-gray-700">
                Department/Section *
              </label>
              <input
                type="text"
                id="userSection"
                name="userSection"
                value={formData.userSection}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.userSection ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter department/section"
              />
              {errors.userSection && (
                <p className="text-red-500 text-sm mt-1">{errors.userSection}</p>
              )}
            </div>

            <div>
              <label htmlFor="costCenter" className="block mb-1 font-medium text-gray-700">
                Cost Center *
              </label>
              <input
                type="text"
                id="costCenter"
                name="costCenter"
                value={formData.costCenter}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.costCenter ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter cost center"
              />
              {errors.costCenter && (
                <p className="text-red-500 text-sm mt-1">{errors.costCenter}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tire Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Tire Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tireSizeRequired" className="block mb-1 font-medium text-gray-700">
                Tire Size Required *
              </label>
              <Autosuggest
                suggestions={tireSizeSuggestions}
                onSuggestionsFetchRequested={({ value }) => {
                  const filteredSizes = tireSizes.filter(size =>
                    size.toLowerCase().includes(value.toLowerCase())
                  );
                  setTireSizeSuggestions(filteredSizes);
                }}
                onSuggestionsClearRequested={() => setTireSizeSuggestions([])}
                getSuggestionValue={(size: string) => size}
                renderSuggestion={(size: string) => (
                  <div className="p-2 hover:bg-gray-100 cursor-pointer">
                    {size}
                  </div>
                )}
                onSuggestionSelected={(_, { suggestion }) => handleTireSizeSelect(suggestion)}
                inputProps={{
                  value: formData.tireSizeRequired,
                  onChange: (_, { newValue }) => {
                    setFormData(prev => ({ ...prev, tireSizeRequired: newValue, tireSize: newValue }));
                  },
                  className: `w-full p-3 border rounded ${errors.tireSizeRequired ? 'border-red-500' : 'border-gray-300'}`,
                  placeholder: "Enter or select tire size"
                }}
                theme={{
                  container: 'relative',
                  suggestionsContainer: 'absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto',
                  suggestionsList: 'list-none p-0 m-0',
                }}
              />
              {errors.tireSizeRequired && (
                <p className="text-red-500 text-sm mt-1">{errors.tireSizeRequired}</p>
              )}
            </div>

            <div>
              <label htmlFor="existingTireMake" className="block mb-1 font-medium text-gray-700">
                Existing Tire Make *
              </label>
              <input
                type="text"
                id="existingTireMake"
                name="existingTireMake"
                value={formData.existingTireMake}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.existingTireMake ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter existing tire make"
              />
              {errors.existingTireMake && (
                <p className="text-red-500 text-sm mt-1">{errors.existingTireMake}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="block mb-1 font-medium text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full p-3 border rounded ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="tubesQuantity" className="block mb-1 font-medium text-gray-700">
                Tubes Quantity *
              </label>
              <input
                type="number"
                id="tubesQuantity"
                name="tubesQuantity"
                value={formData.tubesQuantity}
                onChange={handleChange}
                min="0"
                className={`w-full p-3 border rounded ${errors.tubesQuantity ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter tubes quantity"
              />
              {errors.tubesQuantity && (
                <p className="text-red-500 text-sm mt-1">{errors.tubesQuantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastReplacementDate" className="block mb-1 font-medium text-gray-700">
                Last Replacement Date *
              </label>
              <input
                type="date"
                id="lastReplacementDate"
                name="lastReplacementDate"
                value={formData.lastReplacementDate}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.lastReplacementDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.lastReplacementDate && (
                <p className="text-red-500 text-sm mt-1">{errors.lastReplacementDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="tireWearPattern" className="block mb-1 font-medium text-gray-700">
                Tire Wear Pattern *
              </label>
              <select
                id="tireWearPattern"
                name="tireWearPattern"
                value={formData.tireWearPattern}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.tireWearPattern ? 'border-red-500' : 'border-gray-300'}`}
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
          </div>
        </div>

        {/* Request Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Request Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="requesterName" className="block mb-1 font-medium text-gray-700">
                Requester Name *
              </label>
              <input
                type="text"
                id="requesterName"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.requesterName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter requester name"
              />
              {errors.requesterName && (
                <p className="text-red-500 text-sm mt-1">{errors.requesterName}</p>
              )}
            </div>

            <div>
              <label htmlFor="requesterEmail" className="block mb-1 font-medium text-gray-700">
                Requester Email *
              </label>
              <input
                type="email"
                id="requesterEmail"
                name="requesterEmail"
                value={formData.requesterEmail}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.requesterEmail ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter requester email"
              />
              {errors.requesterEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.requesterEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="requesterPhone" className="block mb-1 font-medium text-gray-700">
                Requester Phone *
              </label>
              <input
                type="tel"
                id="requesterPhone"
                name="requesterPhone"
                value={formData.requesterPhone}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.requesterPhone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter phone number (max 10 digits)"
                maxLength={10}
              />
              {errors.requesterPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.requesterPhone}</p>
              )}
            </div>

            <div>
              <label htmlFor="presentKmReading" className="block mb-1 font-medium text-gray-700">
                Present KM Reading *
              </label>
              <input
                type="number"
                id="presentKmReading"
                name="presentKmReading"
                value={formData.presentKmReading}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.presentKmReading ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter present KM reading"
              />
              {errors.presentKmReading && (
                <p className="text-red-500 text-sm mt-1">{errors.presentKmReading}</p>
              )}
            </div>

            <div>
              <label htmlFor="previousKmReading" className="block mb-1 font-medium text-gray-700">
                Previous KM Reading *
              </label>
              <input
                type="number"
                id="previousKmReading"
                name="previousKmReading"
                value={formData.previousKmReading}
                onChange={handleChange}
                className={`w-full p-3 border rounded ${errors.previousKmReading ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter previous KM reading"
              />
              {errors.previousKmReading && (
                <p className="text-red-500 text-sm mt-1">{errors.previousKmReading}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="requestReason" className="block mb-1 font-medium text-gray-700">
              Request Reason *
            </label>
            <textarea
              id="requestReason"
              name="requestReason"
              value={formData.requestReason}
              onChange={handleChange}
              rows={3}
              className={`w-full p-3 border rounded ${errors.requestReason ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter reason for tire request"
            />
            {errors.requestReason && (
              <p className="text-red-500 text-sm mt-1">{errors.requestReason}</p>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Additional Information</h3>

          <div>
            <label htmlFor="comments" className="block mb-1 font-medium text-gray-700">
              Comments
            </label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter any additional comments"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Upload Images (Max 7)
            </label>
            <div className="grid gap-4 md:grid-cols-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, index)}
                    className={`w-full p-2 border rounded ${
                      errors[`image_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {image && (
                    <div className="mt-2">
                      {typeof image === 'string' ? (
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="text-sm text-gray-600">File selected</div>
                      )}
                    </div>
                  )}
                  {errors[`image_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`image_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={formLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {formLoading ? "Updating..." : "Update Request"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRequestForm;

// EditRequestModal component
export const EditRequestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  request: TireRequest | null;
  onSuccess?: () => void;
}> = ({ isOpen, onClose, request, onSuccess }) => {
  if (!isOpen || !request) return null;

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Tire Request #{request.id}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>

          {/* Status check */}
          {request.status !== "pending" ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Cannot Edit Request
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This request cannot be edited because its status is "{request.status}".
                      Only pending requests can be edited.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit form */
            <div className="max-h-[80vh] overflow-y-auto">
              <EditRequestForm
                request={request}
                onSuccess={handleSuccess}
                onCancel={onClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
