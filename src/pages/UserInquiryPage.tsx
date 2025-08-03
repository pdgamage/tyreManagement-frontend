import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiUrls } from '../config/api';

interface Vehicle {
  id: string;
  vehicleNumber: string;
}

interface RequestDetails {
  id: string;
  orderNumber: string;
  status: string;
  supplierName?: string;
  supplierPhone?: string;
}

const UserInquiryPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [requestDetails, setRequestDetails] = useState<RequestDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (user?.id) {
        try {
          const response = await fetch(apiUrls.vehiclesByUserId(user.id));
          if (!response.ok) {
            throw new Error('Failed to fetch vehicles');
          }
          const data = await response.json();
          setVehicles(data);
        } catch (err) {
          setError('Failed to fetch vehicles.');
          console.error(err);
        }
      }
    };
    fetchVehicles();
  }, [user]);

  useEffect(() => {
    if (selectedVehicle) {
      const fetchRequestDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(apiUrls.requestsByVehicleNumber(selectedVehicle));
          if (!response.ok) {
            throw new Error('Failed to fetch request details');
          }
          const data = await response.json();
          setRequestDetails(data);
        } catch (err) {
          setError('Failed to fetch request details.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchRequestDetails();
    }
  }, [selectedVehicle]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">User Inquiry</h1>
            <p className="text-lg text-gray-600 mt-1">Check the status of your requests by vehicle.</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Select Vehicle</h2>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          >
            <option value="">-- Select a Vehicle --</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.vehicleNumber}>
                {vehicle.vehicleNumber}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="text-center p-10"><p className="text-gray-500">Loading details...</p></div>}
        {error && <div className="text-center p-10"><p className="text-red-500">{error}</p></div>}

        {selectedVehicle && !loading && !error && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Request Details for {selectedVehicle}</h2>
            {requestDetails.length > 0 ? (
              <div className="space-y-4">
                {requestDetails.map((request) => (
                  <div key={request.id} className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">Order Number: <span className="font-normal text-gray-600">{request.orderNumber}</span></p>
                    <p className="font-semibold text-gray-800">Status: <span className="font-normal text-gray-600">{request.status}</span></p>
                    <p className="font-semibold text-gray-800">Supplier: <span className="font-normal text-gray-600">{request.supplierName || 'N/A'}</span></p>
                    <p className="font-semibold text-gray-800">Supplier Phone: <span className="font-normal text-gray-600">{request.supplierPhone || 'N/A'}</span></p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">No requests found for this vehicle.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInquiryPage;
