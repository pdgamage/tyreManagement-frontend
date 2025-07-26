import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { useRequests } from '../contexts/RequestContext';
import { useVehicles } from '../contexts/VehicleContext';
import { useAuth } from '../contexts/AuthContext';
import type { TireRequest } from '../types/api';

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

  useEffect(() => {
    if (request && isOpen) {
      // Initialize form data with request data
      setFormData({
        vehicleNumber: request.vehicleNumber || '',
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
      });
      setError('');
    }
  }, [request, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleNumber = e.target.value;
    const selectedVehicle = vehicles.find(v => v.vehicleNumber === vehicleNumber);
    
    if (selectedVehicle) {
      setFormData((prev: any) => ({
        ...prev,
        vehicleNumber: vehicleNumber,
        vehicleId: selectedVehicle.id,
        vehicleBrand: selectedVehicle.brand,
        vehicleModel: selectedVehicle.model,
        userSection: selectedVehicle.department,
        costCenter: selectedVehicle.costCentre,
      }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    setLoading(true);
    setError('');

    try {
      await updateRequest(request.id.toString(), formData);
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
                  <select
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleVehicleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.vehicleNumber}>
                        {vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Brand *
                  </label>
                  <input
                    type="text"
                    name="vehicleBrand"
                    value={formData.vehicleBrand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tire Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Tire Information
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tubes Quantity *
                  </label>
                  <input
                    type="number"
                    name="tubesQuantity"
                    value={formData.tubesQuantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tire Size Required *
                  </label>
                  <input
                    type="text"
                    name="tireSizeRequired"
                    value={formData.tireSizeRequired}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    value={formData.requesterName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requester Email *
                  </label>
                  <input
                    type="email"
                    name="requesterEmail"
                    value={formData.requesterEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requester Phone *
                  </label>
                  <input
                    type="tel"
                    name="requesterPhone"
                    value={formData.requesterPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Section *
                  </label>
                  <input
                    type="text"
                    name="userSection"
                    value={formData.userSection}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Center *
                  </label>
                  <input
                    type="text"
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    value={formData.requestReason}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Replacement Date *
                  </label>
                  <input
                    type="date"
                    name="lastReplacementDate"
                    value={formData.lastReplacementDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Existing Tire Make *
                  </label>
                  <input
                    type="text"
                    name="existingTireMake"
                    value={formData.existingTireMake}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Present KM Reading *
                  </label>
                  <input
                    type="number"
                    name="presentKmReading"
                    value={formData.presentKmReading}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous KM Reading *
                  </label>
                  <input
                    type="number"
                    name="previousKmReading"
                    value={formData.previousKmReading}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tire Wear Pattern *
                  </label>
                  <input
                    type="text"
                    name="tireWearPattern"
                    value={formData.tireWearPattern}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments}
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
                    {formData.images.map((image: string, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Request image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
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
