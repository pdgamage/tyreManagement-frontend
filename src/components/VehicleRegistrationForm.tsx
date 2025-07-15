import React, { useState } from "react";
import { useVehicles } from "../contexts/VehicleContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Navigate, useLocation } from "react-router-dom";

const VehicleRegistrationForm = () => {
  const { addVehicle, vehicles } = useVehicles();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const [costCentre, setCostCentre] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [vehicleNumberError, setVehicleNumberError] = useState("");

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Instant validation for vehicle number
  const handleVehicleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setVehicleNumber(value);
    if (value.length > 8) {
      setVehicleNumberError("Vehicle Number cannot exceed 8 characters");
    } else {
      setVehicleNumberError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Vehicle number max length validation
    if (vehicleNumber.length > 8) {
      setError("Vehicle Number cannot exceed 8 characters");
      return;
    }

    setFormLoading(true);

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNumber,
          make,
          model,
          type,
          costCentre,
          department,
          status: "active",
          registeredBy: parseInt(user.id),
        }),
      });

      // Check if vehicle number already exists on frontend
      if (vehicles.some((v) => v.vehicleNumber === vehicleNumber)) {
        setError("A vehicle with this number already exists");
        setFormLoading(false);
        return;
      }

      try {
        await addVehicle({
          vehicleNumber,
          make,
          model,
          type,
          costCentre,
          department,
          status: "active",
          registeredBy: parseInt(user.id),
        });
        setSuccess(true);
        setFormLoading(false);

        // Reset form
        setVehicleNumber("");
        setMake("");
        setModel("");
        setType("");
        setCostCentre("");
        setDepartment("");

        // Redirect after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          navigate("/user");
        }, 4000);
      } catch (err: any) {
        setFormLoading(false);
        setError(
          err?.message || "An error occurred while registering the vehicle"
        );
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      setFormLoading(false);
      setError("An error occurred while registering the vehicle");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md">
      {/* Loading Spinner Modal */}
      {success === false && error === "" && formLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-transparent animate-spin"></div>
            <span className="text-lg font-semibold text-white">
              Processing...
            </span>
          </div>
        </div>
      )}

      {/* Popup Modal for Success/Error */}
      {(success || error) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md px-12 py-8 text-center bg-white rounded-lg shadow-lg">
            {success && (
              <div>
                <svg
                  className="mx-auto mb-3 text-green-500 w-14 h-14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div className="mb-2 text-xl font-bold text-green-700">
                  Success
                </div>
                <div className="text-gray-700">
                  Vehicle has been registered successfully!
                </div>
              </div>
            )}
            {error && (
              <div>
                <svg
                  className="mx-auto mb-3 text-red-500 w-14 h-14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <div className="mb-2 text-xl font-bold text-red-700">Error</div>
                <div className="text-gray-700">{error}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="vehicleNumber"
          >
            Vehicle Number
          </label>
          <input
            id="vehicleNumber"
            type="text"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., TRK-2023-001"
            value={vehicleNumber}
            onChange={handleVehicleNumberChange}
            required
          />
          {vehicleNumberError && (
            <p className="mt-1 text-sm text-red-600">{vehicleNumberError}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="make"
            >
              Make
            </label>
            <input
              id="make"
              type="text"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Volvo"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="model"
            >
              Model
            </label>
            <input
              id="model"
              type="text"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., FH16"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="type"
            >
              Vehicle Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Select vehicle type
              </option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Car">Car</option>
              <option value="Bus">Bus</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="costCentre"
            >
              Cost Centre
            </label>
            <input
              id="costCentre"
              type="text"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., CC-001"
              value={costCentre}
              onChange={(e) => setCostCentre(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mb-6">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="department"
          >
            Department
          </label>
          <select
            id="department"
            name="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
            required
          >
            <option value="" disabled>
              Select a department
            </option>
            <option value="" disabled>
              Select a department
            </option>
            <option value="HR department">HR Department</option>
            <option value="IT department">IT Department</option>
            <option value="Marketing department">Marketing Department</option>
            <option value="Security">Security</option>
            <option value="User department">User Department</option>
            <option value="Finance department">Finance Department</option>
            <option value="Procurement department">
              Procurement Department
            </option>
            <option value="Legal department">Legal Department</option>
            <option value="Customer support">Customer Support</option>
            <option value="Operations department">Operations Department</option>
            <option value="Logistics department">Logistics Department</option>
            <option value="Engineering department">
              Engineering Department
            </option>
            <option value="Administration department">
              Administration Department
            </option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full p-3 font-bold text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
        >
          Register Vehicle
        </button>
      </form>
    </div>
  );
};

export default VehicleRegistrationForm;
