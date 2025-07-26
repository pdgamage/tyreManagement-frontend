import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { useRequests } from '../contexts/RequestContext';
import { useVehicles } from '../contexts/VehicleContext';
import { useAuth } from '../contexts/AuthContext';
import Autosuggest from 'react-autosuggest';
import type { TireRequest, Vehicle, TireDetails } from '../types/api';

interface Supervisor {
  id: string;
  name: string;
  email: string;
}

interface EditTireRequestModalProps {
  request: TireRequest | null;
  onClose: () => void;
  isOpen: boolean;
}

const EditTireRequestModal: React.FC<EditTireRequestModalProps> = ({
  request,
  onClose,
  isOpen,
}) => {
  const { updateRequest } = useRequests();
  const { vehicles } = useVehicles();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-suggest states
  const [vehicleSuggestions, setVehicleSuggestions] = useState<Vehicle[]>([]);
  const [tireSizes, setTireSizes] = useState<string[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(true);
  const [tireDetailsLoading, setTireDetailsLoading] = useState(false);

  // Fetch supervisors
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const res = await fetch(
          "https://tyremanagement-backend-production.up.railway.app/api/users/supervisors"
        );
        const data = await res.json();
        setSupervisors(data);
      } catch {
        setSupervisors([]);
      } finally {
        setSupervisorsLoading(false);
      }
    };
    fetchSupervisors();
  }, []);

  // Fetch tire sizes
  useEffect(() => {
    const fetchTireSizes = async () => {
      try {
        const response = await fetch(
          "https://tyremanagement-backend-production.up.railway.app/api/tire-details/sizes"
        );
        const sizes = await response.json();
        setTireSizes(sizes);
      } catch (error) {
        console.error("Error fetching tire sizes:", error);
        setTireSizes([]);
      }
    };
    fetchTireSizes();
  }, []);

  useEffect(() => {
    if (request && isOpen) {
      // Initialize form data with request data
      setFormData({
        vehicleNumber: request.vehicleNumber || '',
        vehicleId: request.vehicleId || '',
        quantity: request.quantity || 1,
        tubesQuantity: request.tubesQuantity || 0,
        tireSize: request.tireSize || '',
        requestReason: request.requestReason || '',
        requesterName: request.requesterName || '',
        requesterEmail: request.requesterEmail || '',
        requesterPhone: request.requesterPhone || '',
        vehicleBrand: request.vehicleBrand || '',
        vehicleModel: request.vehicleModel || '',
        lastReplacementDate: request.lastReplacementDate || '',
        existingTireMake: request.existingTireMake || '',
        tireSizeRequired: request.tireSizeRequired || '',
        presentKmReading: request.presentKmReading || 0,
        previousKmReading: request.previousKmReading || 0,
        tireWearPattern: request.tireWearPattern || '',
        comments: request.comments || '',
        userSection: request.vehicleDepartment || '',
        costCenter: request.vehicleCostCentre || '',
        images: request.images || [],
        supervisorId: request.supervisorId || '',
        deliveryOfficeName: request.deliveryOfficeName || '',
        deliveryStreetName: request.deliveryStreetName || '',
        deliveryTown: request.deliveryTown || '',
        totalPrice: request.totalPrice || '',
        warrantyDistance: request.warrantyDistance || '',
        tireWearIndicatorAppeared: request.tireWearIndicatorAppeared || false,
      });
      setError('');
      setErrors({});
    }
  }, [request, isOpen]);

  // Vehicle auto-suggest functions
  const getVehicleSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    return vehicles.filter((vehicle) =>
      vehicle.vehicleNumber.toLowerCase().includes(inputValue)
    );
  };

  const onVehicleSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setVehicleSuggestions(getVehicleSuggestions(value));
  };

  const onVehicleSuggestionsClearRequested = () => {
    setVehicleSuggestions([]);
  };

  const getVehicleSuggestionValue = (suggestion: Vehicle) => suggestion.vehicleNumber;

  const renderVehicleSuggestion = (suggestion: Vehicle) => (
    <div className="p-2 cursor-pointer hover:bg-gray-100">
      {suggestion.vehicleNumber} - {suggestion.make} {suggestion.model}
    </div>
  );

  const onVehicleSuggestionSelected = (
    _: any,
    { suggestion }: { suggestion: Vehicle }
  ) => {
    handleVehicleSelect(suggestion);
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setFormData((prev: any) => ({
      ...prev,
      vehicleId: vehicle.id.toString(),
      vehicleNumber: vehicle.vehicleNumber,
      vehicleBrand: vehicle.make || '',
      vehicleModel: vehicle.model || '',
      tireSizeRequired: vehicle.tireSize || '',
      userSection: vehicle.department || '',
      costCenter: vehicle.costCentre || '',
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle tire size selection and auto-fill tire details
  const handleTireSizeSelect = async (tireSize: string) => {
    setTireDetailsLoading(true);
    try {
      const response = await fetch(
        `https://tyremanagement-backend-production.up.railway.app/api/tire-details/size/${encodeURIComponent(tireSize)}`
      );

      if (response.ok) {
        const tireDetails: TireDetails = await response.json();

        // Auto-fill the form fields
        setFormData((prev: any) => ({
          ...prev,
          existingTireMake: tireDetails.tire_brand,
          totalPrice: tireDetails.total_price.toString(),
          warrantyDistance: tireDetails.warranty_distance.toString(),
        }));
      } else {
        console.error("Tire details not found for size:", tireSize);
        // Clear the auto-filled fields if no details found
        setFormData((prev: any) => ({
          ...prev,
          existingTireMake: "",
          totalPrice: "",
          warrantyDistance: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching tire details:", error);
      // Clear the auto-filled fields on error
      setFormData((prev: any) => ({
        ...prev,
        existingTireMake: "",
        totalPrice: "",
        warrantyDistance: "",
      }));
    } finally {
      setTireDetailsLoading(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'tire_requests');
    formData.append('cloud_name', 'djocrwprs');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/djocrwprs/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const newImageUrls = await Promise.all(uploadPromises);
      
      setFormData((prev: any) => ({
        ...prev,
        images: [...(prev.images || []), ...newImageUrls],
      }));
    } catch (error) {
      setError('Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    const requiredFields = [
      'vehicleNumber', 'vehicleBrand', 'vehicleModel', 'tireSizeRequired',
      'quantity', 'tubesQuantity', 'requestReason', 'requesterName',
      'requesterEmail', 'requesterPhone', 'userSection', 'costCenter',
      'lastReplacementDate', 'existingTireMake', 'presentKmReading',
      'previousKmReading', 'tireWearPattern', 'supervisorId'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });

    // Phone number validation
    if (formData.requesterPhone) {
      const phoneDigits = formData.requesterPhone.replace(/\D/g, '');
      if (phoneDigits.length === 0) {
        newErrors.requesterPhone = "Phone number is required";
      } else if (phoneDigits.length > 10) {
        newErrors.requesterPhone = "Phone number cannot exceed 10 digits";
      } else if (phoneDigits.startsWith('0')) {
        newErrors.requesterPhone = "Phone number cannot start with zero";
      } else if (!/^\d+$/.test(phoneDigits)) {
        newErrors.requesterPhone = "Phone number must contain only digits";
      }
    }

    // Email validation
    if (formData.requesterEmail && !/\S+@\S+\.\S+/.test(formData.requesterEmail)) {
      newErrors.requesterEmail = "Please enter a valid email address";
    }

    // Vehicle validation
    const vehicleExists = vehicles.some(v => v.vehicleNumber === formData.vehicleNumber);
    if (formData.vehicleNumber && !vehicleExists) {
      newErrors.vehicleNumber = "Vehicle not registered";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    if (!validateForm()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        tireSize: formData.tireSizeRequired,
        userId: user?.id,
      };

      await updateRequest(request.id.toString(), submitData);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to update request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !request) return null;

  // Check if request can be edited
  if (request.status !== 'pending') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cannot Edit Request
              </h3>
              <p className="text-gray-600 mb-4">
                Only pending requests can be edited. This request has status: <strong>{request.status}</strong>
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-2xl font-semibold text-gray-900">
              Edit Request #{request.id}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Vehicle Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number *
                  </label>
                  <div className="relative">
                    <Autosuggest
                      suggestions={vehicleSuggestions}
                      onSuggestionsFetchRequested={onVehicleSuggestionsFetchRequested}
                      onSuggestionsClearRequested={onVehicleSuggestionsClearRequested}
                      getSuggestionValue={getVehicleSuggestionValue}
                      renderSuggestion={renderVehicleSuggestion}
                      inputProps={{
                        placeholder: "Type vehicle number",
                        value: formData.vehicleNumber || '',
                        onChange: (_: React.FormEvent<any>, { newValue }: { newValue: string }) => {
                          setFormData((prev: any) => ({ ...prev, vehicleNumber: newValue }));
                        },
                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                      }}
                      onSuggestionSelected={onVehicleSuggestionSelected}
                      theme={{
                        container: "relative",
                        input: "w-full px-3 py-2 border border-gray-300 rounded-md",
                        suggestionsContainer: "absolute z-10 w-full bg-white shadow-lg rounded mt-1",
                        suggestionsList: "list-none p-0 m-0",
                        suggestion: "p-2 cursor-pointer hover:bg-gray-100",
                        suggestionHighlighted: "bg-blue-100",
                      }}
                    />
                  </div>
                  {errors.vehicleNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Brand *
                  </label>
                  <input
                    type="text"
                    name="vehicleBrand"
                    value={formData.vehicleBrand || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.vehicleBrand && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicleBrand}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.vehicleModel && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicleModel}</p>
                  )}
                </div>
              </div>

              {/* Tire Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Tire Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tire Size Required *
                  </label>
                  <select
                    name="tireSizeRequired"
                    value={formData.tireSizeRequired || ''}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (e.target.value) {
                        handleTireSizeSelect(e.target.value);
                      }
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Tire Size</option>
                    {tireSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {errors.tireSizeRequired && (
                    <p className="mt-1 text-sm text-red-600">{errors.tireSizeRequired}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity || 1}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tubes Quantity *
                  </label>
                  <input
                    type="number"
                    name="tubesQuantity"
                    value={formData.tubesQuantity || 0}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.tubesQuantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.tubesQuantity}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requester Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Requester Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requester Name *
                  </label>
                  <input
                    type="text"
                    name="requesterName"
                    value={formData.requesterName || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.requesterName && (
                    <p className="mt-1 text-sm text-red-600">{errors.requesterName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requester Email *
                  </label>
                  <input
                    type="email"
                    name="requesterEmail"
                    value={formData.requesterEmail || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.requesterEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.requesterEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requester Phone *
                  </label>
                  <input
                    type="tel"
                    name="requesterPhone"
                    value={formData.requesterPhone || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.requesterPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.requesterPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Section *
                  </label>
                  <input
                    type="text"
                    name="userSection"
                    value={formData.userSection || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.userSection && (
                    <p className="mt-1 text-sm text-red-600">{errors.userSection}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Center *
                  </label>
                  <input
                    type="text"
                    name="costCenter"
                    value={formData.costCenter || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.costCenter && (
                    <p className="mt-1 text-sm text-red-600">{errors.costCenter}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Supervisor *
                  </label>
                  <select
                    name="supervisorId"
                    value={formData.supervisorId || ''}
                    onChange={handleInputChange}
                    required
                    disabled={supervisorsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Supervisor</option>
                    {supervisors.map((sup: Supervisor) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.email})
                      </option>
                    ))}
                  </select>
                  {errors.supervisorId && (
                    <p className="mt-1 text-sm text-red-600">{errors.supervisorId}</p>
                  )}
                </div>
              </div>

              {/* Tire Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Tire Details
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Reason *
                  </label>
                  <textarea
                    name="requestReason"
                    value={formData.requestReason || ''}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.requestReason && (
                    <p className="mt-1 text-sm text-red-600">{errors.requestReason}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Replacement Date *
                  </label>
                  <input
                    type="date"
                    name="lastReplacementDate"
                    value={formData.lastReplacementDate || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.lastReplacementDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastReplacementDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Existing Tire Make * {tireDetailsLoading && <span className="text-blue-500">(Auto-filling...)</span>}
                  </label>
                  <input
                    type="text"
                    name="existingTireMake"
                    value={formData.existingTireMake || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.existingTireMake && (
                    <p className="mt-1 text-sm text-red-600">{errors.existingTireMake}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Present KM Reading *
                  </label>
                  <input
                    type="number"
                    name="presentKmReading"
                    value={formData.presentKmReading || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.presentKmReading && (
                    <p className="mt-1 text-sm text-red-600">{errors.presentKmReading}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous KM Reading *
                  </label>
                  <input
                    type="number"
                    name="previousKmReading"
                    value={formData.previousKmReading || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.previousKmReading && (
                    <p className="mt-1 text-sm text-red-600">{errors.previousKmReading}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tire Wear Pattern *
                  </label>
                  <input
                    type="text"
                    name="tireWearPattern"
                    value={formData.tireWearPattern || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.tireWearPattern && (
                    <p className="mt-1 text-sm text-red-600">{errors.tireWearPattern}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Price {tireDetailsLoading && <span className="text-blue-500">(Auto-filling...)</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="totalPrice"
                    value={formData.totalPrice || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty Distance {tireDetailsLoading && <span className="text-blue-500">(Auto-filling...)</span>}
                  </label>
                  <input
                    type="number"
                    name="warrantyDistance"
                    value={formData.warrantyDistance || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Office Name
                </label>
                <input
                  type="text"
                  name="deliveryOfficeName"
                  value={formData.deliveryOfficeName || ''}
                  onChange={handleInputChange}
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
                  value={formData.deliveryStreetName || ''}
                  onChange={handleInputChange}
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
                  value={formData.deliveryTown || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tireWearIndicatorAppeared"
                  name="tireWearIndicatorAppeared"
                  checked={formData.tireWearIndicatorAppeared || false}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, tireWearIndicatorAppeared: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="tireWearIndicatorAppeared" className="ml-2 block text-sm text-gray-900">
                  Tire wear indicator appeared
                </label>
              </div>
            </div>

            {/* Comments */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional comments or notes..."
              />
            </div>

            {/* Images */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                Images
              </h4>

              {/* Current Images */}
              {formData.images && formData.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.filter((image: string) => image && image.trim() !== '').map((image: string, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Request image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                          onError={(e) => {
                            // Hide broken images
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add New Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can upload multiple images. Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTireRequestModal;
