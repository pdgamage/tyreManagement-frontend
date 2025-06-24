import { useState } from 'react';
import VehicleRegistrationForm from '../components/VehicleRegistrationForm';
import RegisteredVehiclesTable from '../components/RegisteredVehiclesTable';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, Plus, List } from 'lucide-react';

const VehicleRegistration = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/user" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeftIcon size={16} className="mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vehicle Registration</h1>
          <p className="text-gray-600">Register and manage vehicles in the system</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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