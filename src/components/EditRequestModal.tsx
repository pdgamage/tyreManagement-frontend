import React, { useState, useEffect } from "react";
import { X, Save, Loader } from "lucide-react";
import Autosuggest from "react-autosuggest";
import { Request } from "../types/request";
import { Vehicle, TireDetails } from "../types/api";
import { useAuth } from "../contexts/AuthContext";
import { useRequests } from "../contexts/RequestContext";
import { useVehicles } from "../contexts/VehicleContext";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

interface EditRequestModalProps {
  request: Request | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditFormData {
  vehicleId: string;
  vehicleNumber: string;
  quantity: string;
  tubesQuantity: string;
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
  presentKmReading: string;
  previousKmReading: string;
  tireWearPattern: string;
  comments: string;
  userSection: string;
  costCenter: string;
  deliveryOfficeName: string;
  deliveryStreetName: string;
  deliveryTown: string;
  totalPrice: string;
  warrantyDistance: string;
  tireWearIndicatorAppeared: boolean;
  images: (File | string | null)[];
  supervisorId: string;
}

interface Supervisor {
  id: number;
  name: string;
  email: string;
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { fetchRequests } = useRequests();
  const { vehicles, loading: vehiclesLoading } = useVehicles();

  const [formData, setFormData] = useState<EditFormData>({
    vehicleId: "",
    vehicleNumber: "",
    quantity: "1",
    tubesQuantity: "0",
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
    presentKmReading: "0",
    previousKmReading: "0",
    tireWearPattern: "",
    comments: "",
    userSection: "",
    costCenter: "",
    deliveryOfficeName: "",
    deliveryStreetName: "",
    deliveryTown: "",
    totalPrice: "0",
    warrantyDistance: "0",
    tireWearIndicatorAppeared: false,
    images: Array(7).fill(null),
    supervisorId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);
  const [tireDetails, setTireDetails] = useState<TireDetails[]>([]);
  const [tireDetailsLoading, setTireDetailsLoading] = useState(false);

  // Vehicle autosuggest state
  const [suggestions, setSuggestions] = useState<Vehicle[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Fetch supervisors and tire details
  useEffect(() => {
    const fetchSupervisors = async () => {
      setSupervisorsLoading(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tyremanagement-backend-production-8fed.up.railway.app";
        const response = await fetch(`${API_BASE_URL}/api/users/supervisors`);
        if (response.ok) {
          const data = await response.json();
          setSupervisors(data);
        }
      } catch (error) {
        console.error("Error fetching supervisors:", error);
      } finally {
        setSupervisorsLoading(false);
      }
    };

    const fetchTireDetails = async () => {
      setTireDetailsLoading(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tyremanagement-backend-production-8fed.up.railway.app";
        const response = await fetch(`${API_BASE_URL}/api/tire-details`);
        if (response.ok) {
          const data = await response.json();
          setTireDetails(data);
        }
      } catch (error) {
        console.error("Error fetching tire details:", error);
      } finally {
        setTireDetailsLoading(false);
      }
    };

    if (isOpen) {
      fetchSupervisors();
      fetchTireDetails();
    }
  }, [isOpen]);

  // Populate form data when request changes
  useEffect(() => {
    if (request) {
      // Handle existing images
      const requestImages = request.images || [];
      const imageArray = Array(7).fill(null);
      requestImages.forEach((img, index) => {
        if (index < 7 && img) {
          imageArray[index] = img; // Store URL strings for existing images
        }
      });
      setExistingImages(requestImages);

      setFormData({
        vehicleId: request.vehicleId?.toString() || "",
        vehicleNumber: request.vehicleNumber || "",
        quantity: request.quantity?.toString() || "1",
        tubesQuantity: request.tubesQuantity?.toString() || "0",
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
        presentKmReading: request.presentKmReading?.toString() || "0",
        previousKmReading: request.previousKmReading?.toString() || "0",
        tireWearPattern: request.tireWearPattern || "",
        comments: request.comments || "",
        userSection: request.userSection || "",
        costCenter: request.costCenter || "",
        deliveryOfficeName: request.deliveryOfficeName || "",
        deliveryStreetName: request.deliveryStreetName || "",
        deliveryTown: request.deliveryTown || "",
        totalPrice: request.totalPrice?.toString() || "0",
        warrantyDistance: request.warrantyDistance?.toString() || "0",
        tireWearIndicatorAppeared: request.tireWearIndicatorAppeared || false,
        images: imageArray,
        supervisorId: request.supervisorId?.toString() || "",
      });
    }
  }, [request]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Vehicle autosuggest functions
  const getSuggestionValue = (suggestion: Vehicle) => suggestion.vehicleNumber;

  const renderSuggestion = (suggestion: Vehicle) => (
    <div className="p-2 hover:bg-gray-100 cursor-pointer">
      <div className="font-medium">{suggestion.vehicleNumber}</div>
      <div className="text-sm text-gray-600">{suggestion.make} {suggestion.model}</div>
    </div>
  );

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    const inputValue = value.trim().toLowerCase();
    const filteredSuggestions = vehicles.filter(vehicle =>
      vehicle.vehicleNumber.toLowerCase().includes(inputValue)
    );
    setSuggestions(filteredSuggestions);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setFormData(prev => ({
      ...prev,
      vehicleId: vehicle.id.toString(),
      vehicleNumber: vehicle.vehicleNumber,
      vehicleBrand: vehicle.make || "",
      vehicleModel: vehicle.model || "",
      tireSizeRequired: vehicle.tireSize || "",
      userSection: vehicle.department || "",
      costCenter: vehicle.costCentre || "",
    }));
  };

  // File handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newImages = [...formData.images];

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSizeInBytes) {
        setErrors(prev => ({
          ...prev,
          [`image_${index}`]: `Image size must be less than 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        }));
        e.target.value = '';
        return;
      }

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`image_${index}`];
        return newErrors;
      });

      newImages[index] = file;
    } else {
      newImages[index] = null;
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`image_${index}`];
        return newErrors;
      });
    }

    setFormData(prev => ({
      ...prev,
      images: newImages,
    }));
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages[index] = null;

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`image_${index}`];
      return newErrors;
    });

    setFormData(prev => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleTireSizeSelect = (tireSize: string) => {
    setFormData(prev => ({
      ...prev,
      tireSizeRequired: tireSize,
      tireSize: tireSize,
    }));
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
    if (!formData.lastReplacementDate || formData.lastReplacementDate.trim() === '') newErrors.lastReplacementDate = "Last replacement date is required";
    if (!formData.existingTireMake.trim()) newErrors.existingTireMake = "Existing tire make is required";
    if (!formData.tireSizeRequired.trim()) newErrors.tireSizeRequired = "Tire size is required";
    if (!formData.tireWearPattern.trim()) newErrors.tireWearPattern = "Tire wear pattern is required";
    if (!formData.userSection.trim()) newErrors.userSection = "Department is required";
    if (!formData.costCenter.trim()) newErrors.costCenter = "Cost center is required";
    // Note: supervisorId is optional for edit, so we don't validate it as required

    // Numeric validations
    const quantity = parseInt(formData.quantity);
    const tubesQuantity = parseInt(formData.tubesQuantity);
    const presentKm = parseInt(formData.presentKmReading);
    const previousKm = parseInt(formData.previousKmReading);

    if (isNaN(quantity) || quantity < 1) newErrors.quantity = "Quantity must be at least 1";
    if (isNaN(tubesQuantity) || tubesQuantity < 0) newErrors.tubesQuantity = "Tubes quantity cannot be negative";
    if (isNaN(presentKm) || presentKm < 0) newErrors.presentKmReading = "Present KM reading cannot be negative";
    if (isNaN(previousKm) || previousKm < 0) newErrors.previousKmReading = "Previous KM reading cannot be negative";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.requesterEmail && !emailRegex.test(formData.requesterEmail)) {
      newErrors.requesterEmail = "Please enter a valid email address";
    }

    // KM reading logic validation
    if (!isNaN(presentKm) && !isNaN(previousKm) && presentKm > 0 && previousKm > 0 &&
        presentKm <= previousKm) {
      newErrors.presentKmReading = "Present KM reading should be greater than previous KM reading";
    }

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form data before validation:", formData);

    if (!validateForm() || !request) {
      console.log("Validation failed or no request");
      return;
    }

    setLoading(true);
    try {
      // Handle image uploads
      const imageUrls: string[] = [];

      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i];
        if (image) {
          if (typeof image === 'string') {
            // Existing image URL
            imageUrls.push(image);
          } else if (image instanceof File) {
            // New file to upload
            try {
              const url = await uploadToCloudinary(image);
              imageUrls.push(url);
            } catch (uploadError) {
              console.error("Error uploading image:", uploadError);
              alert(`Failed to upload image ${i + 1}. Please try again.`);
              setLoading(false);
              return;
            }
          }
        }
      }

      // Prepare data for submission - ensure all required fields are present
      const submitData = {
        vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : null,
        vehicleNumber: formData.vehicleNumber.trim(),
        quantity: parseInt(formData.quantity) || 1,
        tubesQuantity: parseInt(formData.tubesQuantity) || 0,
        requestReason: formData.requestReason.trim(),
        requesterName: formData.requesterName.trim(),
        requesterEmail: formData.requesterEmail.trim(),
        requesterPhone: formData.requesterPhone.trim(),
        vehicleBrand: formData.vehicleBrand.trim(),
        vehicleModel: formData.vehicleModel.trim(),
        lastReplacementDate: formData.lastReplacementDate ? new Date(formData.lastReplacementDate).toISOString().split('T')[0] : null,
        existingTireMake: formData.existingTireMake.trim(),
        tireSizeRequired: formData.tireSizeRequired.trim(),
        presentKmReading: parseInt(formData.presentKmReading) || 0,
        previousKmReading: parseInt(formData.previousKmReading) || 0,
        tireWearPattern: formData.tireWearPattern.trim(),
        comments: formData.comments.trim() || null,
        userSection: formData.userSection.trim(),
        costCenter: formData.costCenter.trim(),
        deliveryOfficeName: formData.deliveryOfficeName.trim() || null,
        deliveryStreetName: formData.deliveryStreetName.trim() || null,
        deliveryTown: formData.deliveryTown.trim() || null,
        totalPrice: parseFloat(formData.totalPrice) || null,
        warrantyDistance: parseInt(formData.warrantyDistance) || null,
        tireWearIndicatorAppeared: formData.tireWearIndicatorAppeared || false,
        supervisorId: formData.supervisorId ? parseInt(formData.supervisorId) : null,
        images: imageUrls,
      };

      console.log("Submit data:", submitData);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tyremanagement-backend-production-8fed.up.railway.app";
      console.log("Using API URL:", API_BASE_URL);
      console.log("Request ID:", request.id);
      console.log("Request object:", request);

      if (!request.id) {
        alert("Error: Request ID is missing");
        return;
      }

      // Validate that we have the essential data
      if (!submitData.vehicleNumber || !submitData.requestReason || !submitData.requesterName) {
        alert("Error: Missing essential form data");
        return;
      }

      // Skip connectivity test and proceed directly to update

      console.log("Making update request to:", `${API_BASE_URL}/api/requests/${request.id}`);
      console.log("Submit data being sent:", JSON.stringify(submitData, null, 2));

      // Create a simplified data object for the update
      const simplifiedData = {
        vehicleNumber: submitData.vehicleNumber,
        requestReason: submitData.requestReason,
        requesterName: submitData.requesterName,
        requesterEmail: submitData.requesterEmail,
        requesterPhone: submitData.requesterPhone,
        comments: submitData.comments || ""
      };

      console.log("Simplified data being sent:", JSON.stringify(simplifiedData, null, 2));

      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/requests/${request.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(simplifiedData),
        });
      } catch (fetchError) {
        console.error("Network error during fetch:", fetchError);
        alert("Network error: Unable to connect to the server. Please check your internet connection and try again.");
        return;
      }

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      let responseData;
      try {
        const responseText = await response.text();
        console.log("Raw response:", responseText.substring(0, 200) + "...");

        if (responseText.trim().startsWith('<')) {
          // Server returned HTML instead of JSON (likely an error page)
          console.error("Server returned HTML instead of JSON");
          alert("Server error: The server returned an error page instead of data. Please check if the backend is running properly.");
          return;
        }

        if (!responseText.trim()) {
          console.error("Empty response from server");
          alert("Server returned empty response. Please try again.");
          return;
        }

        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        alert("Failed to parse server response. Please try again.");
        return;
      }

      console.log("Parsed response data:", responseData);

      if (response.ok && responseData.success) {
        console.log("Update successful!");
        alert("Request updated successfully!");
        await fetchRequests(); // Refresh the requests list
        onSuccess?.();
        onClose();
      } else {
        console.error("Failed to update request:", responseData);
        const errorMessage = responseData.error || responseData.details || responseData.message || 'Unknown error';
        alert(`Failed to update request: ${errorMessage}`);
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
                <div className="relative">
                  <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={{
                      placeholder: "Enter vehicle number",
                      value: formData.vehicleNumber,
                      onChange: (e, { newValue }) => {
                        setFormData(prev => ({ ...prev, vehicleNumber: newValue }));
                      },
                      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                      }`
                    }}
                    onSuggestionSelected={(e, { suggestion }) => {
                      handleVehicleSelect(suggestion);
                    }}
                    theme={{
                      container: 'relative',
                      suggestionsContainer: 'absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto',
                      suggestionsList: 'list-none p-0 m-0',
                      suggestion: 'cursor-pointer',
                      suggestionHighlighted: 'bg-blue-100'
                    }}
                  />
                </div>
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
              <select
                name="tireSizeRequired"
                value={formData.tireSizeRequired}
                onChange={(e) => {
                  handleChange(e);
                  handleTireSizeSelect(e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tireSizeRequired ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select tire size</option>
                {tireDetails.map((tire) => (
                  <option key={tire.id} value={tire.tire_size}>
                    {tire.tire_size} - {tire.tire_brand} (LKR {tire.total_price})
                  </option>
                ))}
              </select>
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

            {/* Supervisor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Supervisor (Optional)
              </label>
              <select
                name="supervisorId"
                value={formData.supervisorId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.supervisorId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a supervisor</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.name} ({supervisor.email})
                  </option>
                ))}
              </select>
              {errors.supervisorId && (
                <p className="text-red-500 text-sm mt-1">{errors.supervisorId}</p>
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

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  {errors[`image_${index}`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`image_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload images of tire wear, damage, or other relevant details (Max size: 5MB per image)
            </p>

            {/* Image Preview Grid */}
            <div className="grid gap-4 mt-4 md:grid-cols-4">
              {formData.images.map((image, index) => {
                if (!image) return null;

                const isFile = image instanceof File;
                const isUrl = typeof image === 'string';

                return (
                  <div key={`preview-${index}`} className="relative group">
                    <img
                      src={isFile ? URL.createObjectURL(image) : image}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-40 border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {isFile ? 'New' : 'Existing'}
                    </div>
                  </div>
                );
              })}
            </div>
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
