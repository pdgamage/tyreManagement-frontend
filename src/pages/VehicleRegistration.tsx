import { useState } from 'react';
import VehicleRegistrationForm from '../components/VehicleRegistrationForm';
import RegisteredVehiclesTable from '../components/RegisteredVehiclesTable';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, Plus, List } from 'lucide-react';

const VehicleRegistration = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Gradient */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Vehicle Registration</h1>
              <p className="text-emerald-100 mt-1">Register and manage vehicles in the system</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Back to Dashboard */}
              <Link
                to="/user"
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
              >
                <ArrowLeftIcon size={18} />
                <span>Back to Dashboard</span>
              </Link>
              {/* User Avatar */}
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="flex space-x-1 bg-emerald-500/20 p-1 rounded-lg backdrop-blur-sm">
            <button
              onClick={() => setShowForm(false)}
              className={`${
                !showForm
                  ? "bg-white text-emerald-700 shadow-md"
                  : "text-emerald-100 hover:text-white hover:bg-emerald-500/30"
              } flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              <List size={20} />
              <span>View Vehicles</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className={`${
                showForm
                  ? "bg-white text-emerald-700 shadow-md"
                  : "text-emerald-100 hover:text-white hover:bg-emerald-500/30"
              } flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              <Plus size={20} />
              <span>Register New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-4">
        {showForm ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Plus size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Register New Vehicle</h2>
                  <p className="text-gray-600 mt-1">Add a new vehicle to your fleet</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <VehicleRegistrationForm />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <List size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Registered Vehicles</h2>
                  <p className="text-gray-600 mt-1">View and manage your vehicle fleet</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <RegisteredVehiclesTable />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VehicleRegistration;