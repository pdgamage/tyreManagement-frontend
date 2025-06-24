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
  const [year, setYear] = useState(new Date().getFullYear());
  const [tireSize, setTireSize] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    setFormLoading(true);

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNumber,
          make,
          model,
          year,
          tireSize,
          department,
          status: "active",
          registeredBy: user.id, // <-- Add this line
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
          year,
          tireSize,
          department,
          status: "active",
          registeredBy: user.id, // <-- Add this
        });
        setSuccess(true);
        setFormLoading(false);

        // Reset form
        setVehicleNumber("");
        setMake("");
        setModel("");
        setYear(new Date().getFullYear());
        setTireSize("");
        setDepartment("");

        // Redirect after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          navigate("/user");
        }, 4000);
      } catch (err: any) {
        setFormLoading(false);
        // Show backend error if available, otherwise generic error
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

      <h2 className="mb-6 text-2xl font-bold">Register New Vehicle</h2>
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
            onChange={(e) => setVehicleNumber(e.target.value)}
            required
          />
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
              htmlFor="year"
            >
              Year
            </label>
            <input
              id="year"
              type="number"
              min="1990"
              max={new Date().getFullYear() + 1}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
            />
          </div>
          <div>
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="tireSize"
            >
              Tire Size
            </label>
            <input
              id="tireSize"
              type="text"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 275/70R22.5"
              value={tireSize}
              onChange={(e) => setTireSize(e.target.value)}
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
          <input
            id="department"
            type="text"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Logistics"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
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
