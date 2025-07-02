import React, { useState, useEffect } from "react";
import { useVehicles } from "../contexts/VehicleContext";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import Autosuggest from "react-autosuggest";
import { Vehicle } from "../types/api";
import RequestTable from "./RequestTable";
import { Request } from "../types/request";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

interface TireRequestFormProps {
  onSuccess?: () => void;
}

interface TireFormData {
  vehicleNumber: string;
  vehicleId: string;
  year: string;
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
            htmlFor="year"
            className="block mb-1 font-medium text-gray-700"
          >
            Year *
          </label>
          <input
            type="text"
            id="year"
            name="year"
            value={formData.year}
            className="w-full p-3 border border-gray-300 rounded"
            required
            readOnly
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year}</p>
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
        <input
          type="text"
          id="existingTireMake"
          name="existingTireMake"
          value={formData.existingTireMake}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded"
          required
        />
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

const RequestInformationStep: React.FC<StepProps> = ({
  formData,
  handleChange,
  errors,
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
    </div>
    <div className="space-y-4">
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
            Phone *
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
    </div>
  </div>
);

// const RequesterDetailsStep: React.FC<StepProps> = ({
//   formData,
//   handleChange,
//   errors,
// }) => (
//   <div className="space-y-4">
//     <h3 className="mb-4 text-xl font-semibold">Requester Details</h3>
//     <div className="grid gap-4 md:grid-cols-3">
//       <div>
//         <label
//           htmlFor="requesterName"
//           className="block mb-1 font-medium text-gray-700"
//         >
//           Name *
//         </label>
//         <input
//           type="text"
//           id="requesterName"
//           name="requesterName"
//           value={formData.requesterName}
//           onChange={handleChange}
//           className="w-full p-3 border border-gray-300 rounded"
//           required
//           readOnly
//         />
//         {errors.requesterName && (
//           <p className="mt-1 text-sm text-red-600">{errors.requesterName}</p>
//         )}
//       </div>
//       <div>
//         <label
//           htmlFor="requesterEmail"
//           className="block mb-1 font-medium text-gray-700"
//         >
//           Email *
//         </label>
//         <input
//           type="email"
//           id="requesterEmail"
//           name="requesterEmail"
//           value={formData.requesterEmail}
//           onChange={handleChange}
//           className="w-full p-3 border border-gray-300 rounded"
//           required
//           readOnly
//         />
//         {errors.requesterEmail && (
//           <p className="mt-1 text-sm text-red-600">{errors.requesterEmail}</p>
//         )}
//       </div>
//       <div>
//         <label
//           htmlFor="requesterPhone"
//           className="block mb-1 font-medium text-gray-700"
//         >
//           Phone *
//         </label>
//         <input
//           type="tel"
//           id="requesterPhone"
//           name="requesterPhone"
//           value={formData.requesterPhone}
//           onChange={handleChange}
//           className="w-full p-3 border border-gray-300 rounded"
//           required
//         />
//         {errors.requesterPhone && (
//           <p className="mt-1 text-sm text-red-600">{errors.requesterPhone}</p>
//         )}
//       </div>
//     </div>
//   </div>
// );

const AdditionalInformationStep: React.FC<StepProps> = ({
  formData,
  handleChange,
  handleFileChange,
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
      </div>
    </div>
  );
};

// Main component
// Component implementations
const TireRequestForm: React.FC<TireRequestFormProps> = ({ onSuccess }) => {
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { user } = useAuth();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);

  // Fetch requests when component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          "https://tyremanagement-backend-production.up.railway.app/api/requests/user/" +
            user?.id
        );
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    if (user?.id) {
      fetchRequests();
    }
  }, [user?.id]);

  const handleView = (request: Request) => {
    // Implement view logic if needed
  };

  const initialFormData = {
    vehicleNumber: "",
    vehicleId: "",
    year: "",
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
      year: vehicle.year ? vehicle.year.toString() : "",
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
        if (!formData.year) newErrors.year = "Year is required";
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
        images: imageUrls, // send URLs, not files
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

      setFormLoading(false);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setFormData(initialFormData);
        setCurrentStep(1);
        if (onSuccess) onSuccess();
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
    return <div>Loading vehicles...</div>;
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
            />
          )}

          {currentStep === 4 && (
            <AdditionalInformationStep
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              errors={errors}
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
        <RequestTable
          requests={requests}
          title="Your Tire Requests"
          onView={handleView}
          onApprove={() => {}}
          onReject={() => {}}
          showActions={false}
        />
      </div>
    </div>
  );
};

export default TireRequestForm;


// sample comit