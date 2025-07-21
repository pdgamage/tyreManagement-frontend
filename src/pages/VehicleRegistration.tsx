import { useState } from 'react';
import VehicleRegistrationForm from '../components/VehicleRegistrationForm';
import RegisteredVehiclesTable from '../components/RegisteredVehiclesTable';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, Plus, List } from 'lucide-react';

const VehicleRegistration = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Vehicle Registration</h1>
          <p className="text-gray-600">Register and manage vehicles in the system</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {showForm ? (
            <>
              <List size={20} className="mr-2" />
              View Vehicles
            </>
          ) : (
            <>
              <Plus size={20} className="mr-2" />
              Register New
            </>
          )}
        </button>
      </div>

      {showForm ? (
        <VehicleRegistrationForm />
      ) : (
        <RegisteredVehiclesTable />
      )}
    </div>
  );
};

export default VehicleRegistration;