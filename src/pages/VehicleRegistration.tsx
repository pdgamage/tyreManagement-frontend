import { useState } from 'react';
import VehicleRegistrationForm from '../components/VehicleRegistrationForm';
import RegisteredVehiclesTable from '../components/RegisteredVehiclesTable';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, Plus, List, Car, Users, Building2, BarChart3, Activity } from 'lucide-react';
import { useVehicles } from '../contexts/VehicleContext';

const VehicleRegistration = () => {
  const [showForm, setShowForm] = useState(false);
  const { vehicles } = useVehicles();

  // Calculate statistics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const vehicleTypes = [...new Set(vehicles.map(v => v.type))].length;
  const departments = [...new Set(vehicles.map(v => v.department))].length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Vehicle Management
                </h1>
                <p className="text-slate-300 text-lg font-medium mt-1">
                  Register and manage your fleet vehicles
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400 font-medium">Fleet Management System</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-sm text-slate-400">Professional Dashboard</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  showForm
                    ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white hover:from-slate-700 hover:to-gray-800'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
                }`}
              >
                {showForm ? (
                  <>
                    <List size={20} className="mr-2" />
                    View Fleet
                  </>
                ) : (
                  <>
                    <Plus size={20} className="mr-2" />
                    Register Vehicle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Vehicles</p>
                <p className="text-3xl font-bold">{totalVehicles}</p>
                <p className="text-blue-200 text-xs">Registered in system</p>
              </div>
              <div className="w-12 h-12 bg-blue-400/30 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl border border-emerald-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Active Vehicles</p>
                <p className="text-3xl font-bold">{activeVehicles}</p>
                <p className="text-emerald-200 text-xs">Currently operational</p>
              </div>
              <div className="w-12 h-12 bg-emerald-400/30 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Vehicle Types</p>
                <p className="text-3xl font-bold">{vehicleTypes}</p>
                <p className="text-purple-200 text-xs">Different categories</p>
              </div>
              <div className="w-12 h-12 bg-purple-400/30 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl border border-orange-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Departments</p>
                <p className="text-3xl font-bold">{departments}</p>
                <p className="text-orange-200 text-xs">Using fleet services</p>
              </div>
              <div className="w-12 h-12 bg-orange-400/30 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className={`px-8 py-6 border-b border-gray-200 ${
            showForm
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50'
              : 'bg-gradient-to-r from-slate-50 to-gray-50'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                showForm
                  ? 'bg-blue-500'
                  : 'bg-slate-500'
              }`}>
                {showForm ? (
                  <Plus className="w-5 h-5 text-white" />
                ) : (
                  <List className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${
                  showForm ? 'text-blue-900' : 'text-slate-900'
                }`}>
                  {showForm ? 'Register New Vehicle' : 'Fleet Overview'}
                </h2>
                <p className={`text-sm ${
                  showForm ? 'text-blue-700' : 'text-slate-700'
                }`}>
                  {showForm
                    ? 'Add a new vehicle to your fleet management system'
                    : 'View and manage all registered vehicles in your fleet'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {showForm ? (
              <VehicleRegistrationForm />
            ) : (
              <RegisteredVehiclesTable />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VehicleRegistration;