import React, { useState, useEffect } from "react";
import { useVehicles } from "../contexts/VehicleContext";
import { useAuth } from "../contexts/AuthContext";
import { useRequests } from "../contexts/RequestContext";
import { Navigate, useLocation } from "react-router-dom";
import Autosuggest from "react-autosuggest";
import { Vehicle } from "../types/api";
import RequestTable from "./RequestTable";
import { Request } from "../types/request";
import { TireRequest } from "../types/api";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import RequestDetailsModal from "./RequestDetailsModal";

interface TireRequestFormProps {
  onSuccess?: () => void;
}

interface TireFormData {
  vehicleNumber: string;
  vehicleId: string;
  vehicleType: string;
  vehicleDepartment: string;
  vehicleCostCentre: string;
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
  errors: Record<string, string>;
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
            htmlFor="vehicleType"
            className="block mb-1 font-medium text-gray-700"
          >
            Vehicle Type *
          </label>
          <input
            type="text"
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType}
            className="w-full p-3 border border-gray-300 rounded"
            required
            readOnly
          />
          {errors.vehicleType && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="vehicleDepartment"
            className="block mb-1 font-medium text-gray-700"
          >
            Department *
          </label>
          <input
            type="text"
            id="vehicleDepartment"
            name="vehicleDepartment"
            value={formData.vehicleDepartment}
            className="w-full p-3 border border-gray-300 rounded"
            required
            readOnly
          />
          {errors.vehicleDepartment && (
            <p className="mt-1 text-sm text-red-600">
              {errors.vehicleDepartment}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="vehicleCostCentre"
            className="block mb-1 font-medium text-gray-700"
          >
            Cost Centre *
          </label>
          <input
            type="text"
            id="vehicleCostCentre"
            name="vehicleCostCentre"
            value={formData.vehicleCostCentre}
            className="w-full p-3 border border-gray-300 rounded"
            required
            readOnly
          />
          {errors.vehicleCostCentre && (
            <p className="mt-1 text-sm text-red-600">
              {errors.vehicleCostCentre}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const TireDetailsStep: React.FC<StepProps> = ({
  formData,
  handleChange,
  errors,
}) => (
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
        <input
          type="text"
          id="tireSizeRequired"
          name="tireSizeRequired"
          value={formData.tireSizeRequired}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded"
          required
        />
        {errors.tireSizeRequired && (
          <p className="mt-1 text-sm text-red-600">{errors.tireSizeRequired}</p>
        )}
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
          htmlFor="existingTireMake"
          className="block mb-1 font-medium text-gray-700"
        >
          Brand name *
        </label>
        <select
          id="existingTireMake"
          name="existingTireMake"
          value={formData.existingTireMake}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a tire brand</option>
          <option value="Michelin">Michelin</option>
          <option value="Bridgestone">Bridgestone</option>
          <option value="Goodyear">Goodyear</option>
          <option value="Continental">Continental</option>
          <option value="Pirelli">Pirelli</option>
          <option value="Dunlop">Dunlop</option>
          <option value="Yokohama">Yokohama</option>
          <option value="Hankook">Hankook</option>
          <option value="Kumho">Kumho</option>
          <option value="Toyo">Toyo</option>
          <option value="Maxxis">Maxxis</option>
          <option value="BFGoodrich">BFGoodrich</option>
          <option value="Falken">Falken</option>
          <option value="Nitto">Nitto</option>
          <option value="Cooper">Cooper</option>
          <option value="General">General</option>
          <option value="Nexen">Nexen</option>
          <option value="Firestone">Firestone</option>
          <option value="Uniroyal">Uniroyal</option>
          <option value="Nokian">Nokian</option>
          <option value="Sumitomo">Sumitomo</option>
          <option value="Hercules">Hercules</option>
          <option value="Mastercraft">Mastercraft</option>
          <option value="Dick Cepek">Dick Cepek</option>
          <option value="Mickey Thompson">Mickey Thompson</option>
          <option value="Other">Other</option>
        </select>
        {errors.existingTireMake && (
          <p className="mt-1 text-sm text-red-600">{errors.existingTireMake}</p>
        )}
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
          className="w-full p-3 border border-gray-300 rounded"
          max={new Date(Date.now() - 86400000).toISOString().split("T")[0]} // yesterday
          required
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
          <p className="mt-1 text-sm text-red-600">{errors.presentKmReading}</p>
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
          <p className="mt-1 text-sm text-red-600">{errors.tireWearPattern}</p>
        )}
      </div>
    </div>
  </div>
);

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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="userSection"
            className="block mb-1 font-medium text-gray-700"
          >
            Department/Section *
          </label>
          <select
            id="userSection"
            name="userSection"
            value={formData.userSection}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            required
          >
            <option value="">Select Department</option>
            <option value="Field Operations">
              Field Operations / Service Delivery
            </option>
            <option value="Logistics & Distribution">
              Logistics & Distribution
            </option>
            <option value="Sales & Marketing">Sales & Marketing</option>
            <option value="Customer Support">Customer Support </option>
            <option value="Maintenance & Technical Support">
              Maintenance & Technical Support
            </option>
            <option value="Security">Security</option>
            <option value="Training & HR">Training & HR</option>
          </select>
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
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
          {errors.costCenter && (
            <p className="mt-1 text-sm text-red-600">{errors.costCenter}</p>
          )}
        </div>
      </div>
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
            className="w-full p-3 border border-gray-300 rounded"
            placeholder="Enter total price"
            min="0"
            step="0.01"
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
            className="w-full p-3 border border-gray-300 rounded"
            placeholder="Enter warranty distance"
            min="0"
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
  errors,
  supervisors,
  supervisorsLoading,
}) => {
  const removeImage = (index: number) => {
    const e = {
      target: { files: null },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(e, index);
  };

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
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
          <p className="mt-1 mb-4 text-sm text-gray-500">
            Upload images of tire wear, damage, or other relevant details
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
                      onClick={() => removeImage(index)}
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
const TireRequestForm: React.FC<TireRequestFormProps> = ({ onSuccess }) => {
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

  // Fetch requests when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user?.id, fetchRequests]);

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
      vehicleType: "", // These fields are not stored in requests, will be populated from vehicle data
      vehicleDepartment: "",
      vehicleCostCentre: "",
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

  const initialFormData = {
    vehicleNumber: "",
    vehicleId: "",
    vehicleType: "",
    vehicleDepartment: "",
    vehicleCostCentre: "",
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const newImages = [...formData.images];
      newImages[index] = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        images: newImages,
      }));
    }
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setFormData((prev) => ({
      ...prev,
      vehicleId: vehicle.id.toString(),
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.type || "",
      vehicleDepartment: vehicle.department || "",
      vehicleCostCentre: vehicle.costCentre || "",
      vehicleBrand: vehicle.make || "",
      vehicleModel: vehicle.model || "",
      tireSizeRequired: "", // Tire size is no longer stored in vehicle, user must enter manually
    }));
  };

  const vehicleNumberExists = (number: string) =>
    vehicles.some(
      (v) =>
        v.vehicleNumber.trim().toLowerCase() === number.trim().toLowerCase()
    );

  // Real-time validation for vehicle number
  useEffect(() => {
    if (formData.vehicleNumber) {
      if (!vehicleNumberExists(formData.vehicleNumber)) {
        setErrors((prev) => ({
          ...prev,
          vehicleNumber: "Vehicle not registered",
        }));
      } else {
        setErrors((prev) => {
          const { vehicleNumber, ...rest } = prev;
          return rest;
        });
      }
    }
    // eslint-disable-next-line
  }, [formData.vehicleNumber, vehicles]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.vehicleNumber)
          newErrors.vehicleNumber = "Vehicle number is required";
        else if (!vehicleNumberExists(formData.vehicleNumber))
          newErrors.vehicleNumber = "Vehicle not registered";
        if (!formData.vehicleBrand)
          newErrors.vehicleBrand = "Vehicle brand is required";
        if (!formData.vehicleModel)
          newErrors.vehicleModel = "Vehicle model is required";
        if (!formData.vehicleType)
          newErrors.vehicleType = "Vehicle type is required";
        if (!formData.vehicleDepartment)
          newErrors.vehicleDepartment = "Department is required";
        if (!formData.vehicleCostCentre)
          newErrors.vehicleCostCentre = "Cost centre is required";
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
        if (!formData.userSection)
          newErrors.userSection = "Department/Section is required";
        if (!formData.costCenter)
          newErrors.costCenter = "Cost center is required";
        break;
      case 4:
        if (!formData.requesterName)
          newErrors.requesterName = "Name is required";
        if (!formData.requesterEmail)
          newErrors.requesterEmail = "Email is required";
        if (!formData.requesterPhone)
          newErrors.requesterPhone = "Phone is required";
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
      const response = await fetch(
        "https://tyremanagement-backend-production.up.railway.app/api/requests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      // Refresh requests to show new request
      fetchRequests();

      if (onSuccess) onSuccess();

      setFormLoading(false);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setFormData({
          ...initialFormData,
          requesterName: user.name || "",
          requesterEmail: user.email || "",
        });
        setCurrentStep(1);
      }, 2000);
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
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests/${deleteId}`,
        {
          method: "DELETE",
        }
      );
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
              errors={errors}
              supervisors={supervisors}
              supervisorsLoading={supervisorsLoading}
            />
          )}
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            className={`px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200
              ${currentStep === 1 ? "invisible" : ""}`}
          >
            Previous
          </button>
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
            <button
              type="submit"
              disabled={formLoading}
              className={`px-6 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700
                ${formLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {formLoading ? "Submitting..." : "Submit Request"}
            </button>
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

        <RequestTable
          requests={requests.filter((req) => req.userId === user?.id)}
          title="Your Tire Requests"
          onView={handleView}
          onApprove={() => {}}
          onReject={() => {}}
          onDelete={handleDelete}
          onPlaceOrder={() => {}} // Empty function - no place order for users
          showActions={true}
          showPlaceOrderButton={false} // Disable place order button for regular users
        />
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
