import React, { useState, useEffect } from "react";
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
  const [costCentre, setCostCentre] = useState(() => user?.costCentre || "");
  const [department, setDepartment] = useState(() => user?.department || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [vehicleNumberError, setVehicleNumberError] = useState("");

  // Initialize and update costCentre and department when user changes
  useEffect(() => {
    console.log("Current user data:", user);
    if (user) {
      // Make sure to update only if the values are different
      const newCostCentre = user.costCentre || ""; // match the database column casing
      const newDepartment = user.department || "";
      
      if (costCentre !== newCostCentre) {
        setCostCentre(newCostCentre);
        console.log("Setting costCentre to:", newCostCentre);
      }
      if (department !== newDepartment) {
        setDepartment(newDepartment);
        console.log("Setting department to:", newDepartment);
      }
      
      console.log("Updated form values:", {
        costCentre: newCostCentre,
        department: newDepartment
      });
    }
  }, [user]);

  // Auto-fill costCentre and department from user
  useEffect(() => {
    if (user) {
      console.log("Setting user data:", user);
      setCostCentre(user.costCentre || "");
      setDepartment(user.department || "");
    }
  }, [user]);

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
        // Format the data to match the database column names exactly
        const vehicleData = {
          vehicleNumber,
          make,
          model,
          type,
          cost_centre: costCentre, // match the exact database column name
          department,
          status: "active",
          registeredBy: parseInt(user.id),
        };
        console.log('Sending vehicle data:', vehicleData); // Debug log
        await addVehicle(vehicleData);
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Vehicle Identification Section */}
        <div className="p-6 border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-blue-900">
            <div className="flex items-center justify-center w-6 h-6 mr-3 bg-blue-500 rounded-lg">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            Vehicle Identification
          </h3>

          <div className="space-y-6">
            <div>
              <label
                className="block mb-3 text-sm font-semibold text-gray-800"
                htmlFor="vehicleNumber"
              >
                Vehicle Number *
              </label>
              <input
                id="vehicleNumber"
                type="text"
                className="w-full p-4 transition-all duration-200 bg-white border-2 border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:shadow-md"
                placeholder="e.g., TRK-2023-001"
                value={vehicleNumber}
                onChange={handleVehicleNumberChange}
                required
              />
              {vehicleNumberError && (
                <p className="flex items-center mt-2 text-sm text-red-600">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {vehicleNumberError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  className="block mb-3 text-sm font-semibold text-gray-800"
                  htmlFor="make"
                >
                  Brand *
                </label>
                <input
                  id="make"
                  type="text"
                  className="w-full p-4 transition-all duration-200 bg-white border-2 border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:shadow-md"
                  placeholder="e.g., Volvo, Mercedes, Toyota"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  className="block mb-3 text-sm font-semibold text-gray-800"
                  htmlFor="model"
                >
                  Model *
                </label>
                <input
                  id="model"
                  type="text"
                  className="w-full p-4 transition-all duration-200 bg-white border-2 border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:shadow-md"
                  placeholder="e.g., FH16, Actros, Camry"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        {/* Vehicle Classification Section */}
        <div className="p-6 border border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-purple-900">
            <div className="flex items-center justify-center w-6 h-6 mr-3 bg-purple-500 rounded-lg">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            Vehicle Classification
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                className="block mb-3 text-sm font-semibold text-gray-800"
                htmlFor="type"
              >
                Vehicle Type *
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-4 transition-all duration-200 bg-white border-2 border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-md"
                required
              >
                <option value="" disabled>
                  Select vehicle type
                </option>
                <option value="Truck">🚛 Truck</option>
                <option value="Van">🚐 Van</option>
                <option value="Car">🚗 Car</option>
                <option value="Bus">🚌 Bus</option>
                <option value="Motorcycle">🏍️ Motorcycle</option>
                <option value="Other">🚙 Other</option>
              </select>
            </div>
            <div>
              <label
                className="block mb-3 text-sm font-semibold text-gray-800"
                htmlFor="costCentre"
              >
                Cost Centre *
              </label>
              <input
                id="costCentre"
                type="text"
                className="w-full p-4 transition-all duration-200 bg-white border-2 border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:shadow-md"
                placeholder="Auto-filled from user"
                value={costCentre}
                readOnly
                required
              />
            </div>
          </div>
        </div>
        {/* Department Assignment Section */}
        <div className="p-6 border bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-emerald-100">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-emerald-900">
            <div className="flex items-center justify-center w-6 h-6 mr-3 rounded-lg bg-emerald-500">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            Department Assignment
          </h3>

          <div>
            <label
              className="block mb-3 text-sm font-semibold text-gray-800"
              htmlFor="department"
            >
              Department *
            </label>
            <input
              id="department"
              type="text"
              className="w-full p-4 transition-all duration-200 bg-white border-2 border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:shadow-md"
              placeholder="Auto-filled from user"
              value={department}
              readOnly
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={formLoading}
            className={`w-full max-w-md px-8 py-4 font-bold text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
              formLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl"
            }`}
          >
            {formLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 mr-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Register Vehicle
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleRegistrationForm;
