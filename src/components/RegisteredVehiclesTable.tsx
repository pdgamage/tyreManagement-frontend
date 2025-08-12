import React, { useState } from "react";
import { Eye } from "lucide-react";
import { useVehicles } from "../contexts/VehicleContext";

interface Vehicle {
  id: number;
  vehicleNumber: string;
  make: string;
  model: string;
  type: string;
  cost_centre: string;
  department: string;
  status: string;
}

const RegisteredVehiclesTable = () => {
  const { vehicles, loading } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Display all vehicles by default
  const displayedVehicles = vehicles;

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Registered Vehicles ({vehicles.length})
        </h2>

        {/* Scrollable container with max height */}
        <div className="overflow-x-auto">
          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Make/Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Centre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">No vehicles registered</p>
                        <p className="text-sm text-gray-500">Register your first vehicle to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.vehicleNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vehicle.make}</div>
                        <div className="text-sm text-gray-500">{vehicle.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.cost_centre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetails(vehicle)}
                          className="inline-flex items-center p-1 text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {showModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Vehicle Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Vehicle Number
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVehicle.vehicleNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Make</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVehicle.make}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Model</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVehicle.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Cost Centre
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVehicle.cost_centre}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Department
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVehicle.department}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVehicle.status}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedVehicle(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredVehiclesTable;
