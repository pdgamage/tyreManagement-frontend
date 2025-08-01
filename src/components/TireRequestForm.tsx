import React, { useState, useEffect } from "react";
import { useVehicles } from "../contexts/VehicleContext";
import { useAuth } from "../contexts/AuthContext";
import { useRequests } from "../contexts/RequestContext";
import { Navigate, useLocation } from "react-router-dom";
import Autosuggest from "react-autosuggest";
import { Vehicle, TireDetails } from "../types/api";
import { Request } from "../types/request";
import { TireRequest } from "../types/api";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import RequestDetailsModal from "./RequestDetailsModal";
import { apiUrls } from "../config/api";

interface TireRequestFormProps {
  onSuccess?: () => void;
  editMode?: boolean;
  existingRequest?: Request;
  onRequestUpdated?: () => void;
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
  images: (File | null)[];
  userId?: number;
  supervisorId: string;
  // New delivery and pricing fields
  deliveryOfficeName: string;
  deliveryStreetName: string;
  deliveryTown: string;
  totalPrice: string;
  warrantyDistance: string;
  tireWearIndicatorAppeared: boolean;
}

interface StepProps {
  formData: TireFormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
  removeImage?: (index: number) => void;
  errors: Record<string, string>;
}

interface TireDetailsStepProps extends StepProps {
  onTireSizeSelect: (tireSize: string) => void;
}

interface VehicleInformationStepProps extends StepProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
}

interface Supervisor {
  id: number;
  name: string;
  email: string;
}

const VehicleInformationStep: React.FC<VehicleInformationStepProps> = ({
  formData,
  handleChange,
  errors,
  vehicles,
  onVehicleSelect,
}) => {
  const [suggestions, setSuggestions] = useState<Vehicle[]>([]);

  const getSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    return vehicles.filter((vehicle) =>
      vehicle.vehicleNumber.toLowerCase().includes(inputValue)
    );
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: Vehicle) => suggestion.vehicleNumber;

  const renderSuggestion = (suggestion: Vehicle) => (
    <div className="p-2 cursor-pointer hover:bg-gray-100">
      {suggestion.vehicleNumber} - {suggestion.make} {suggestion.model}
    </div>
  );

  const inputProps = {
    placeholder: "Type vehicle number",
    value: formData.vehicleNumber,
    onChange: (_: React.FormEvent<any>, { newValue }: { newValue: string }) => {
      handleChange({
        target: { name: "vehicleNumber", value: newValue },
      } as React.ChangeEvent<HTMLInputElement>);
    },
    className:
      "w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
  };

  const onSuggestionSelected = (
    _: any,
    { suggestion }: { suggestion: Vehicle }
  ) => {
    onVehicleSelect(suggestion);
  };

  return (
    <div className="space-y-4">
      <h3 className="mb-4 text-xl font-semibold">Vehicle Information</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="vehicleNumber"
            className="block mb-1 font-medium text-gray-700"
          >
            Vehicle Number *
          </label>
          <div className="relative">
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              inputProps={inputProps}
              onSuggestionSelected={onSuggestionSelected}
              theme={{
                container: "relative",
                input: "w-full p-3 border border-gray-300 rounded",
                suggestionsContainer:
                  "absolute z-10 w-full bg-white shadow-lg rounded mt-1",
                suggestionsList: "list-none p-0 m-0 max-h-60 overflow-auto",
                suggestion: "cursor-pointer",
                suggestionHighlighted: "bg-gray-100",
              }}
            />
          </div>
          {errors.vehicleNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="vehicleBrand"
            className="block mb-1 font-medium text-gray-700"
          >
            Vehicle Brand *
          </label>
          <input
            type="text"
            id="vehicleBrand"
            name="vehicleBrand"
            value={formData.vehicleBrand}
            className="w-full p-3 border border-gray-300 rounded"
            required
            readOnly
          />
          {errors.vehicleBrand && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleBrand}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="vehicleModel"
            className="block mb-1 font-medium text-gray-700"
          >
            Vehicle Model *
          </label>
          <input
            type="text"
            id="vehicleModel"
            name="vehicleModel"
            value={formData.vehicleModel}
            className="w-full p-3 border border-gray-300 rounded"
            required
            readOnly
          />
          {errors.vehicleModel && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleModel}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="userSection"
            className="block mb-1 font-medium text-gray-700"
          >
            Department *
          </label>
          <input
            type="text"
            id="userSection"
            name="userSection"
            value={formData.userSection}
            className="w-full p-3 border border-gray-300 rounded bg-gray-50"
            placeholder="Department (auto-filled from user)"
            required
            readOnly
          />
          {errors.userSection && (
            <p className="mt-1 text-sm text-red-600">{errors.userSection}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="costCenter"
            className="block mb-1 font-medium text-gray-700"
          >
            Cost Center *
          </label>
          <input
            type="text"
            id="costCenter"
            name="costCenter"
            value={formData.costCenter}
            className="w-full p-3 border border-gray-300 rounded bg-gray-50"
            placeholder="Cost center (auto-filled from user)"
            required
            readOnly
          />
          {errors.costCenter && (
            <p className="mt-1 text-sm text-red-600">{errors.costCenter}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const TireDetailsStep: React.FC<TireDetailsStepProps> = ({
  formData,
  handleChange,
  errors,
  onTireSizeSelect,
}) => {
  const [tireSizes, setTireSizes] = useState<string[]>([]);
  const [tireSizesLoading, setTireSizesLoading] = useState(true);
  const [tireSizesError, setTireSizesError] = useState<string | null>(null);

  // Fetch tire sizes when component mounts
  useEffect(() => {
    const fetchTireSizes = async () => {
      try {
        setTireSizesError(null);
        const response = await fetch(apiUrls.tireSizes());
        if (!response.ok) {
          throw new Error(
            `Failed to fetch tire sizes: ${response.status} ${response.statusText}`
          );
        }
        const sizes = await response.json();
        if (Array.isArray(sizes)) {
          setTireSizes(sizes);
        } else {
          throw new Error("Invalid response format for tire sizes");
        }
      } catch (error) {
        console.error("Error fetching tire sizes:", error);
        setTireSizesError(
          error instanceof Error ? error.message : "Failed to load tire sizes"
        );
        setTireSizes([]);
      } finally {
        setTireSizesLoading(false);
      }
    };
    fetchTireSizes();
  }, []);

  const handleTireSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSize = e.target.value;
    handleChange(e); // Update the form data
    if (selectedSize) {
      onTireSizeSelect(selectedSize); // Trigger auto-fill
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="mb-4 text-xl font-semibold">Tire Details</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="tireSizeRequired"
            className="block mb-1 font-medium text-gray-700"
          >
            Tire Size Required *
          </label>
          <select
            id="tireSizeRequired"
            name="tireSizeRequired"
            value={formData.tireSizeRequired}
            onChange={handleTireSizeChange}
            className="w-full p-3 border border-gray-300 rounded"
            required
            disabled={tireSizesLoading}
          >
            <option value="">
              {tireSizesLoading ? "Loading tire sizes..." : "Select tire size"}
            </option>
            {tireSizes.length === 0 && !tireSizesLoading && (
              <option value="" disabled>
                No tire sizes available
              </option>
            )}
            {tireSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          {errors.tireSizeRequired && (
            <p className="mt-1 text-sm text-red-600">
              {errors.tireSizeRequired}
            </p>
          )}
          {tireSizesError && (
            <p className="mt-1 text-sm text-red-600">{tireSizesError}</p>
          )}
          {tireSizesLoading && (
            <p className="mt-1 text-sm text-blue-600">Loading tire sizes...</p>
          )}
        </div>
        <div>
          <label
            htmlFor="existingTireMake"
            className="block mb-1 font-medium text-gray-700"
          >
            Brand name *
          </label>
          <input
            type="text"
            id="existingTireMake"
            name="existingTireMake"
            value={formData.existingTireMake}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            placeholder="Brand name (auto-filled when tire size is selected)"
            required
            readOnly
          />
          {errors.existingTireMake && (
            <p className="mt-1 text-sm text-red-600">
              {errors.existingTireMake}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="totalPrice"
            className="block mb-1 font-medium text-gray-700"
          >
            Total Price (LKR)
          </label>
          <input
            type="number"
            id="totalPrice"
            name="totalPrice"
            value={formData.totalPrice}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded bg-gray-50"
            placeholder="Total price (auto-filled when tire size is selected)"
            min="0"
            step="0.01"
            readOnly
          />
        </div>
        <div>
          <label
            htmlFor="warrantyDistance"
            className="block mb-1 font-medium text-gray-700"
          >
            Warranty Distance (KM)
          </label>
          <input
            type="number"
            id="warrantyDistance"
            name="warrantyDistance"
            value={formData.warrantyDistance}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded bg-gray-50"
            placeholder="Warranty distance (auto-filled when tire size is selected)"
            min="0"
            readOnly
          />
        </div>
        <div>
          <label
            htmlFor="quantity"
            className="block mb-1 font-medium text-gray-700"
          >
            Quantity *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="tubesQuantity"
            className="block mb-1 font-medium text-gray-700"
          >
            Tubes Quantity
          </label>
          <input
            type="number"
            id="tubesQuantity"
            name="tubesQuantity"
            min="0"
            value={formData.tubesQuantity}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label
            htmlFor="lastReplacementDate"
            className="block mb-1 font-medium text-gray-700"
          >
            Last Replacement Date *
          </label>
          <input
            type="date"
            id="lastReplacementDate"
            name="lastReplacementDate"
            value={formData.lastReplacementDate}
            onChange={handleChange}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              e.preventDefault()
            } // Prevent typing
            onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
              e.preventDefault()
            } // Prevent pasting
            className="w-full p-3 border border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            max={new Date(Date.now() - 86400000).toISOString().split("T")[0]} // yesterday
            required
            readOnly={false} // Keep as false to allow date picker interaction
            style={{ caretColor: "transparent" }} // Hide text cursor
          />
          {errors.lastReplacementDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lastReplacementDate}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="presentKmReading"
            className="block mb-1 font-medium text-gray-700"
          >
            Current KM Reading *
          </label>
          <input
            type="number"
            id="presentKmReading"
            name="presentKmReading"
            value={formData.presentKmReading}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            min="0"
            required
          />
          {errors.presentKmReading && (
            <p className="mt-1 text-sm text-red-600">
              {errors.presentKmReading}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="previousKmReading"
            className="block mb-1 font-medium text-gray-700"
          >
            Previous KM Reading *
          </label>
          <input
            type="number"
            id="previousKmReading"
            name="previousKmReading"
            value={formData.previousKmReading}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            min="0"
            required
          />
          {errors.previousKmReading && (
            <p className="mt-1 text-sm text-red-600">
              {errors.previousKmReading}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            KM Difference
          </label>
          <div className="w-full p-3 text-gray-700 border border-gray-200 rounded bg-gray-50">
            {(() => {
              const current = parseInt(formData.presentKmReading) || 0;
              const previous = parseInt(formData.previousKmReading) || 0;
              const difference = current - previous;
              return difference >= 0 ? difference.toLocaleString() : 0;
            })()}
          </div>
        </div>
        <div>
          <label
            htmlFor="tireWearPattern"
            className="block mb-1 font-medium text-gray-700"
          >
            Tire Wear Pattern *
          </label>
          <select
            id="tireWearPattern"
            name="tireWearPattern"
            value={formData.tireWearPattern}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            required
          >
            <option value="">Select wear pattern</option>
            <option value="Even">Even</option>
            <option value="Center">Center</option>
            <option value="Edge">Edge</option>
            <option value="One-Sided">One-Sided</option>
            <option value="Patches">Patches</option>
            <option value="Other">Other</option>
          </select>
          {errors.tireWearPattern && (
            <p className="mt-1 text-sm text-red-600">
              {errors.tireWearPattern}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface RequestInformationStepProps extends StepProps {
  supervisors: Supervisor[];
  supervisorsLoading: boolean;
}

const RequestInformationStep: React.FC<RequestInformationStepProps> = ({
  formData,
  handleChange,
  errors,
  supervisors,
  supervisorsLoading,
}) => (
  <div className="space-y-4">
    <h3 className="mb-4 text-xl font-semibold">Request Information</h3>
    <div className="grid gap-4">
      <div>
        <label
          htmlFor="requestReason"
          className="block mb-1 font-medium text-gray-700"
        >
          Request Reason *
        </label>
        <textarea
          id="requestReason"
          name="requestReason"
          value={formData.requestReason}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded"
          required
        />
        {errors.requestReason && (
          <p className="mt-1 text-sm text-red-600">{errors.requestReason}</p>
        )}
      </div>
      {/* Department and Cost Center fields moved to Vehicle Information section */}
      {/* Supervisor select field removed from here */}
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <label
          htmlFor="requesterName"
          className="block mb-1 font-medium text-gray-700"
        >
          Name *
        </label>
        <input
          type="text"
          id="requesterName"
          name="requesterName"
          value={formData.requesterName}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded"
          required
          readOnly
        />
        {errors.requesterName && (
          <p className="mt-1 text-sm text-red-600">{errors.requesterName}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="requesterEmail"
          className="block mb-1 font-medium text-gray-700"
        >
          Email *
        </label>
        <input
          type="email"
          id="requesterEmail"
          name="requesterEmail"
          value={formData.requesterEmail}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded"
          required
          readOnly
        />
        {errors.requesterEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.requesterEmail}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="requesterPhone"
          className="block mb-1 font-medium text-gray-700"
        >
          Phone Number *
        </label>
        <input
          type="tel"
          id="requesterPhone"
          name="requesterPhone"
          value={formData.requesterPhone}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded"
          placeholder="Enter phone number (max 10 digits, no leading zeros)"
          maxLength={10}
          pattern="[1-9][0-9]*"
          inputMode="numeric"
          required
        />
        {errors.requesterPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.requesterPhone}</p>
        )}
      </div>
    </div>

    {/* New Section 2: Delivery and Pricing Information */}
    <div className="mt-6 space-y-4">
      <h4 className="text-lg font-semibold text-gray-800">
        Delivery & Pricing Information
      </h4>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="deliveryOfficeName"
            className="block mb-1 font-medium text-gray-700"
          >
            Delivery Office Name
          </label>
          <input
            type="text"
            id="deliveryOfficeName"
            name="deliveryOfficeName"
            value={formData.deliveryOfficeName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            placeholder="Enter delivery office name"
          />
        </div>
        <div>
          <label
            htmlFor="deliveryStreetName"
            className="block mb-1 font-medium text-gray-700"
          >
            Delivery Street Name
          </label>
          <input
            type="text"
            id="deliveryStreetName"
            name="deliveryStreetName"
            value={formData.deliveryStreetName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            placeholder="Enter delivery street address"
          />
        </div>
        <div>
          <label
            htmlFor="deliveryTown"
            className="block mb-1 font-medium text-gray-700"
          >
            Delivery Town
          </label>
          <input
            type="text"
            id="deliveryTown"
            name="deliveryTown"
            value={formData.deliveryTown}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            placeholder="Enter delivery town/city"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Tire Wear Indicator Appeared
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="tireWearIndicatorAppeared"
                value="true"
                checked={formData.tireWearIndicatorAppeared === true}
                onChange={() =>
                  handleChange({
                    target: { name: "tireWearIndicatorAppeared", value: true },
                  } as any)
                }
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="tireWearIndicatorAppeared"
                value="false"
                checked={formData.tireWearIndicatorAppeared === false}
                onChange={() =>
                  handleChange({
                    target: { name: "tireWearIndicatorAppeared", value: false },
                  } as any)
                }
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface AdditionalInformationStepProps extends StepProps {
  supervisors: Supervisor[];
  supervisorsLoading: boolean;
}

const AdditionalInformationStep: React.FC<AdditionalInformationStepProps> = ({
  formData,
  handleChange,
  handleFileChange,
  removeImage,
  errors,
  supervisors,
  supervisorsLoading,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="mb-4 text-xl font-semibold">Additional Information</h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="comments"
            className="block mb-1 font-medium text-gray-700"
          >
            Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Upload Images (Max 7)
          </label>
          <div className="grid gap-4 md:grid-cols-4">
            {formData.images.map((_, index) => (
              <div key={index} className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  className={`w-full p-2 border rounded ${
                    errors[`image_${index}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors[`image_${index}`] && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors[`image_${index}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-1 mb-4 text-sm text-gray-500">
            Upload images of tire wear, damage, or other relevant details (Max
            size: 5MB per image)
          </p>

          {/* Image Preview Grid */}
          <div className="grid gap-4 mt-4 md:grid-cols-4">
            {formData.images.map(
              (file, index) =>
                file && (
                  <div key={`preview-${index}`} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Uploaded preview ${index + 1}`}
                      className="object-cover w-full h-40 border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage && removeImage(index)}
                      className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="supervisorId"
            className="block mb-1 font-medium text-gray-700"
          >
            Select Supervisor *
          </label>
          <select
            id="supervisorId"
            name="supervisorId"
            value={formData.supervisorId}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            required
            disabled={supervisorsLoading}
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
    </div>
  );
};

// Main component
// Component implementations
const TireRequestForm: React.FC<TireRequestFormProps> = ({
  onSuccess,
  editMode = false,
  existingRequest,
  onRequestUpdated,
  onCancel,
}) => {
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { user } = useAuth();
  const { requests, fetchRequests, lastUpdate } = useRequests();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TireRequest | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(true);
  const [tireDetailsLoading, setTireDetailsLoading] = useState(false);

  // Fetch requests when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user?.id, fetchRequests]);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const res = await fetch(apiUrls.supervisors());
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setSupervisors(data);
      } catch (error) {
        console.error("Error fetching supervisors:", error);
        setSupervisors([]);
      } finally {
        setSupervisorsLoading(false);
      }
    };
    fetchSupervisors();
  }, []);

  // Convert Request type to TireRequest type for the modal
  const convertRequestToTireRequest = (request: Request): TireRequest => {
    return {
      id: parseInt(request.id),
      vehicleId: parseInt(request.vehicleId || "0"),
      vehicleNumber: request.vehicleNumber,
      quantity: request.quantity,
      tubesQuantity: request.tubesQuantity,
      tireSize: request.tireSize,
      requestReason: request.requestReason,
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      requesterPhone: request.requesterPhone,
      vehicleBrand: request.vehicleBrand,
      vehicleModel: request.vehicleModel,
      userSection: request.userSection,
      lastReplacementDate:
        typeof request.lastReplacementDate === "string"
          ? request.lastReplacementDate
          : request.lastReplacementDate.toISOString(),
      existingTireMake: request.existingTireMake,
      tireSizeRequired: request.tireSizeRequired,
      costCenter: request.costCenter,
      presentKmReading: request.presentKmReading,
      previousKmReading: request.previousKmReading,
      tireWearPattern: request.tireWearPattern,
      comments: request.comments || undefined,
      images: request.images,
      status: request.status,
      submittedAt:
        typeof request.submittedAt === "string"
          ? request.submittedAt
          : request.submittedAt.toISOString(),
      supervisorNotes: request.supervisor_notes,
      technicalManagerNotes: request.technical_manager_note,
      engineerNotes: request.engineer_note,
      customer_officer_note: request.customer_officer_note,
      // New delivery and pricing fields
      deliveryOfficeName: request.deliveryOfficeName,
      deliveryStreetName: request.deliveryStreetName,
      deliveryTown: request.deliveryTown,
      totalPrice: request.totalPrice,
      warrantyDistance: request.warrantyDistance,
      tireWearIndicatorAppeared: request.tireWearIndicatorAppeared,
    };
  };

  const handleView = (request: Request) => {
    const convertedRequest = convertRequestToTireRequest(request);
    setSelectedRequest(convertedRequest);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  // Function to handle tire size selection and auto-fill tire details
  const handleTireSizeSelect = async (tireSize: string) => {
    setTireDetailsLoading(true);
    try {
      const response = await fetch(apiUrls.tireDetailsBySize(tireSize));

      if (response.ok) {
        const tireDetails: TireDetails = await response.json();

        // Auto-fill the form fields
        setFormData((prev) => ({
          ...prev,
          existingTireMake: tireDetails.tire_brand,
          totalPrice: tireDetails.total_price.toString(),
          warrantyDistance: tireDetails.warranty_distance.toString(),
        }));
      } else {
        console.error("Tire details not found for size:", tireSize);
        // Clear the auto-filled fields if no details found
        setFormData((prev) => ({
          ...prev,
          existingTireMake: "",
          totalPrice: "",
          warrantyDistance: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching tire details:", error);
      // Clear the auto-filled fields on error
      setFormData((prev) => ({
        ...prev,
        existingTireMake: "",
        totalPrice: "",
        warrantyDistance: "",
      }));
    } finally {
      setTireDetailsLoading(false);
    }
  };

  const initialFormData = {
    vehicleNumber: "",
    vehicleId: "",
    vehicleBrand: "",
    vehicleModel: "",
    tireSizeRequired: "",
    quantity: 1,
    tubesQuantity: 0,
    requestReason: "",
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    userSection: "",
    lastReplacementDate: "",
    existingTireMake: "",
    costCenter: "",
    presentKmReading: "",
    previousKmReading: "",
    tireWearPattern: "",
    comments: "",
    images: Array(7).fill(null),
    supervisorId: "",
    // New delivery and pricing fields
    deliveryOfficeName: "",
    deliveryStreetName: "",
    deliveryTown: "",
    totalPrice: "",
    warrantyDistance: "",
    tireWearIndicatorAppeared: false,
  };

  const [formData, setFormData] = useState<TireFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form data when in edit mode
  useEffect(() => {
    if (editMode && existingRequest) {
      setFormData({
        vehicleNumber: existingRequest.vehicleNumber || "",
        vehicleId: existingRequest.vehicleId?.toString() || "",
        vehicleBrand: existingRequest.vehicleBrand || "",
        vehicleModel: existingRequest.vehicleModel || "",
        tireSizeRequired: existingRequest.tireSizeRequired || "",
        quantity: existingRequest.quantity || 1,
        tubesQuantity: existingRequest.tubesQuantity || 0,
        requestReason: existingRequest.requestReason || "",
        requesterName: existingRequest.requesterName || "",
        requesterEmail: existingRequest.requesterEmail || "",
        requesterPhone: existingRequest.requesterPhone || "",
        userSection: existingRequest.userSection || "",
        lastReplacementDate:
          typeof existingRequest.lastReplacementDate === "string"
            ? existingRequest.lastReplacementDate
            : existingRequest.lastReplacementDate
                ?.toISOString()
                .split("T")[0] || "",
        existingTireMake: existingRequest.existingTireMake || "",
        costCenter: existingRequest.costCenter || "",
        presentKmReading: existingRequest.presentKmReading?.toString() || "",
        previousKmReading: existingRequest.previousKmReading?.toString() || "",
        tireWearPattern: existingRequest.tireWearPattern || "",
        comments: existingRequest.comments || "",
        images: Array(7).fill(null), // Reset images for edit mode
        supervisorId: existingRequest.supervisorId?.toString() || "",
        deliveryOfficeName: existingRequest.deliveryOfficeName || "",
        deliveryStreetName: existingRequest.deliveryStreetName || "",
        deliveryTown: existingRequest.deliveryTown || "",
        totalPrice: existingRequest.totalPrice?.toString() || "",
        warrantyDistance: existingRequest.warrantyDistance?.toString() || "",
        tireWearIndicatorAppeared:
          existingRequest.tireWearIndicatorAppeared || false,
      });
    }
  }, [editMode, existingRequest]);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for phone number to limit to 10 digits and remove leading zeros
    if (name === "requesterPhone") {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, "");
      // Remove leading zeros
      const withoutLeadingZeros = digitsOnly.replace(/^0+/, "");
      // Limit to 10 digits maximum
      const limitedValue = withoutLeadingZeros.slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: limitedValue,
      }));
      return;
    }

    // Special handling for date fields to ensure proper formatting
    if (name === "lastReplacementDate") {
      // Ensure the date is in YYYY-MM-DD format and set time to start of day
      if (value) {
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime())) {
          // Format as YYYY-MM-DD to ensure consistency
          const formattedDate = dateObj.toISOString().split("T")[0];
          setFormData((prev) => ({
            ...prev,
            [name]: formattedDate,
          }));
          return;
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newImages = [...formData.images];

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB in bytes

      // Check file size
      if (file.size > maxSizeInBytes) {
        // Show error message
        setErrors((prev) => ({
          ...prev,
          [`image_${index}`]: `Image size must be less than 5MB. Current size: ${formatFileSize(
            file.size
          )}`,
        }));

        // Clear the file input
        e.target.value = "";
        return;
      }

      // Clear any previous error for this image
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`image_${index}`];
        return newErrors;
      });

      // Adding a new image
      newImages[index] = file;
    } else {
      // Removing an image (when files is null or empty)
      newImages[index] = null;

      // Clear any error for this image
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`image_${index}`];
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages[index] = null;

    // Clear any error for this image
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`image_${index}`];
      return newErrors;
    });

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setFormData((prev) => ({
      ...prev,
      vehicleId: vehicle.id.toString(),
      vehicleNumber: vehicle.vehicleNumber,
      vehicleBrand: vehicle.make || "",
      vehicleModel: vehicle.model || "",
      tireSizeRequired: vehicle.tireSize || "",
    }));
  };

  const vehicleNumberExists = (number: string) =>
    vehicles.some(
      (v) =>
        v.vehicleNumber.trim().toLowerCase() === number.trim().toLowerCase()
    );

  // Check for duplicate/recent requests for the same vehicle
  const checkVehicleRequestRestrictions = (vehicleNumber: string) => {
    if (!vehicleNumber || !requests) return null;

    const vehicleRequests = requests.filter(
      (req) =>
        req.vehicleNumber.trim().toLowerCase() ===
        vehicleNumber.trim().toLowerCase()
    );

    // Check for pending requests
    const pendingRequests = vehicleRequests.filter(
      (req) => !["rejected", "complete", "order placed"].includes(req.status)
    );

    if (pendingRequests.length > 0) {
      const latestPending = pendingRequests[0];
      return {
        type: "pending",
        message: `Vehicle ${vehicleNumber} already has a pending tire request (Status: ${latestPending.status.replace(
          /_/g,
          " "
        )}). Please wait for the current request to be processed.`,
        requestId: latestPending.id,
        status: latestPending.status,
      };
    }

    // Check for recent completed requests (within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompletedRequests = vehicleRequests.filter((req) => {
      const isCompleted = ["complete", "order placed"].includes(req.status);
      const requestDate = new Date(req.submittedAt);
      return isCompleted && requestDate >= thirtyDaysAgo;
    });

    if (recentCompletedRequests.length > 0) {
      const latestCompleted = recentCompletedRequests[0];
      const requestDate = new Date(latestCompleted.submittedAt);
      const daysSince = Math.ceil(
        (new Date().getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = 30 - daysSince;

      return {
        type: "recent",
        message: `Vehicle ${vehicleNumber} had a tire request completed ${daysSince} days ago. Please wait ${daysRemaining} more days before submitting a new request.`,
        lastRequestDate: latestCompleted.submittedAt,
        daysRemaining: daysRemaining,
      };
    }

    return null;
  };

  // Real-time validation for vehicle number
  useEffect(() => {
    if (formData.vehicleNumber) {
      if (!vehicleNumberExists(formData.vehicleNumber)) {
        setErrors((prev) => ({
          ...prev,
          vehicleNumber: "Vehicle not registered",
        }));
      } else {
        // Check for duplicate/recent requests
        const restriction = checkVehicleRequestRestrictions(
          formData.vehicleNumber
        );
        if (restriction) {
          setErrors((prev) => ({
            ...prev,
            vehicleNumber: restriction.message,
          }));
        } else {
          setErrors((prev) => {
            const { vehicleNumber, ...rest } = prev;
            return rest;
          });
        }
      }
    }
    // eslint-disable-next-line
  }, [formData.vehicleNumber, vehicles, requests]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.vehicleNumber) {
          newErrors.vehicleNumber = "Vehicle number is required";
        } else if (!vehicleNumberExists(formData.vehicleNumber)) {
          newErrors.vehicleNumber = "Vehicle not registered";
        } else {
          // Check for duplicate/recent requests
          const restriction = checkVehicleRequestRestrictions(
            formData.vehicleNumber
          );
          if (restriction) {
            newErrors.vehicleNumber = restriction.message;
          }
        }
        if (!formData.vehicleBrand)
          newErrors.vehicleBrand = "Vehicle brand is required";
        if (!formData.vehicleModel)
          newErrors.vehicleModel = "Vehicle model is required";
        if (!formData.userSection)
          newErrors.userSection = "Department is required";
        if (!formData.costCenter)
          newErrors.costCenter = "Cost center is required";
        break;
      case 2:
        if (!formData.tireSizeRequired)
          newErrors.tireSizeRequired = "Tire size is required";
        if (!formData.quantity || formData.quantity < 1)
          newErrors.quantity = "Valid quantity is required";
        if (!formData.existingTireMake)
          newErrors.existingTireMake = "Existing tire make is required";
        if (!formData.lastReplacementDate)
          newErrors.lastReplacementDate = "Last replacement date is required";
        if (!formData.presentKmReading)
          newErrors.presentKmReading = "Current KM reading is required";
        if (!formData.previousKmReading)
          newErrors.previousKmReading = "Previous KM reading is required";
        if (formData.presentKmReading && formData.previousKmReading) {
          const current = parseInt(formData.presentKmReading);
          const previous = parseInt(formData.previousKmReading);
          if (current < previous)
            newErrors.presentKmReading =
              "Current KM cannot be less than previous KM";
        }
        if (!formData.tireWearPattern)
          newErrors.tireWearPattern = "Tire wear pattern is required";
        break;
      case 3:
        if (!formData.requestReason)
          newErrors.requestReason = "Request reason is required";
        break;
      case 4:
        if (!formData.requesterName)
          newErrors.requesterName = "Name is required";
        if (!formData.requesterEmail)
          newErrors.requesterEmail = "Email is required";
        if (!formData.requesterPhone) {
          newErrors.requesterPhone = "Phone is required";
        } else {
          // Validate phone number format (digits only, max 10 digits, no leading zeros)
          const phoneDigits = formData.requesterPhone.replace(/\D/g, "");
          if (phoneDigits.length === 0) {
            newErrors.requesterPhone = "Phone number is required";
          } else if (phoneDigits.length > 10) {
            newErrors.requesterPhone = "Phone number cannot exceed 10 digits";
          } else if (phoneDigits.startsWith("0")) {
            newErrors.requesterPhone = "Phone number cannot start with zero";
          } else if (!/^\d+$/.test(phoneDigits)) {
            newErrors.requesterPhone = "Phone number must contain only digits";
          }
          // Note: Leading zeros are automatically removed
        }
        if (!formData.supervisorId)
          newErrors.supervisorId = "Supervisor is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to submit a tire request.");
      return;
    }

    // Validate all steps before submitting
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    // Check for image size errors
    const imageErrors = Object.keys(errors).filter((key) =>
      key.startsWith("image_")
    );
    if (imageErrors.length > 0) {
      setError("Please fix image size errors before submitting.");
      setCurrentStep(4); // Go to the step with image uploads
      return;
    }

    setFormLoading(true);

    try {
      // 1. Upload images to Cloudinary
      const imageFiles = formData.images.filter(Boolean) as File[];
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }

      // 2. Prepare data to send to backend
      const submitData = {
        ...formData,
        userId: user.id,
        tireSize: formData.tireSizeRequired,
        submittedAt: new Date().toISOString(),
        images: imageUrls,
        supervisorId: formData.supervisorId, // <-- add this
      };

      // 3. Send to backend (as JSON)
      const url =
        editMode && existingRequest
          ? apiUrls.requestById(existingRequest.id)
          : apiUrls.requests();

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(
          editMode ? "Failed to update request" : "Failed to submit request"
        );
      }

      // Refresh requests to show updated/new request
      fetchRequests();

      if (editMode && onRequestUpdated) {
        onRequestUpdated();
      } else if (onSuccess) {
        onSuccess();
      }

      setFormLoading(false);
      setSuccess(true);

      if (!editMode) {
        setTimeout(() => {
          setSuccess(false);
          setFormData({
            ...initialFormData,
            requesterName: user.name || "",
            requesterEmail: user.email || "",
          });
          setCurrentStep(1);
        }, 2000);
      }
    } catch (err) {
      setFormLoading(false);
      setError("An error occurred while submitting your request");
    }
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        requesterName: user.name || "",
        requesterEmail: user.email || "",
        costCenter: user.costCentre || "",
        userSection: user.department || "",
      }));
    }
  }, [user]);

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (vehiclesLoading) {
    return <div>Loading details...</div>;
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold">
          Tire Replacement Approval Request
        </h2>
        <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          No vehicles found. Please contact your administrator.
        </div>
      </div>
    );
  }

  // Delete logic for user requests
  const handleDelete = async (id: string) => {
    setShowDeleteConfirm(true);
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(apiUrls.requestById(deleteId), {
        method: "DELETE",
      });
      fetchRequests(); // Refresh requests after deletion
    } catch {
      // Optionally show an error in your modal, but do NOT use alert()
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <div className="relative p-6 space-y-8 bg-white rounded-lg shadow-md">
      <div className="mb-8">
        <div className="relative">
          <div className="absolute left-0 w-full h-1 -translate-y-1/2 bg-gray-200 top-1/2"></div>
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10
                  ${
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <span>Vehicle Info</span>
          <span>Tire Details</span>
          <span>Request Info</span>
          <span>Additional Info</span>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded ">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded">
          Request submitted successfully!
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === 4) {
            handleSubmit(e);
          }
        }}
        className="space-y-6"
      >
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <VehicleInformationStep
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              errors={errors}
              vehicles={vehicles}
              onVehicleSelect={handleVehicleSelect}
            />
          )}
          {currentStep === 2 && (
            <TireDetailsStep
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              errors={errors}
              onTireSizeSelect={handleTireSizeSelect}
            />
          )}
          {currentStep === 3 && (
            <RequestInformationStep
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              errors={errors}
              supervisors={supervisors}
              supervisorsLoading={supervisorsLoading}
            />
          )}

          {currentStep === 4 && (
            <AdditionalInformationStep
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              removeImage={removeImage}
              errors={errors}
              supervisors={supervisors}
              supervisorsLoading={supervisorsLoading}
            />
          )}
        </div>

        <div className="flex justify-between mt-8">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handlePrevious}
              className={`px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200
                ${currentStep === 1 ? "invisible" : ""}`}
            >
              Previous
            </button>
            {editMode && onCancel && currentStep === 1 && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <div className="flex space-x-3">
              {editMode && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={formLoading}
                className={`px-6 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700
                  ${formLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {formLoading
                  ? editMode
                    ? "Updating..."
                    : "Submitting..."
                  : editMode
                  ? "Update Request"
                  : "Submit Request"}
              </button>
            </div>
          )}
        </div>
      </form>

      <div className="pt-8 mt-12 border-t">
        {/* Connection Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg pointer-events-auto">
            <h3 className="mb-4 text-lg font-semibold text-red-700">
              Confirm Deletion
            </h3>
            <p className="mb-6">
              Are you sure you want to delete this request?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TireRequestForm;

// sample comit
