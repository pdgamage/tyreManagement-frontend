import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrls } from "../config/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserInquiryDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch registered vehicles
    const fetchVehicles = async () => {
      try {
        const response = await fetch(apiUrls.vehicles);
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(apiUrls.requests);
      const data = await response.json();
      const vehicleRequests = data.filter(
        (req) => req.vehicleNumber === selectedVehicle
      );
      setRequests(vehicleRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleFilterByDate = () => {
    if (startDate && endDate) {
      const filtered = requests.filter((req) => {
        const requestDate = new Date(req.submittedAt);
        return requestDate >= startDate && requestDate <= endDate;
      });
      setFilteredRequests(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-2xl border-b border-slate-200">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              User Inquiry Dashboard
            </h1>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Search by Vehicle Number
            </h2>
            <div className="flex items-center space-x-4 mb-6">
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.number}>
                    {vehicle.number}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Search
              </button>
            </div>

            {requests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Request Details
                </h3>
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Status</th>
                      <th className="px-4 py-2 border-b">Order Number</th>
                      <th className="px-4 py-2 border-b">Supplier Name</th>
                      <th className="px-4 py-2 border-b">Supplier Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td className="px-4 py-2 border-b">{req.status}</td>
                        <td className="px-4 py-2 border-b">{req.orderNumber}</td>
                        <td className="px-4 py-2 border-b">{req.supplierName}</td>
                        <td className="px-4 py-2 border-b">{req.supplierNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Filter by Date Range
            </h2>
            <div className="flex items-center space-x-4 mb-6">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Start Date"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="End Date"
              />
              <button
                onClick={handleFilterByDate}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Filter
              </button>
            </div>

            {filteredRequests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Filtered Requests
                </h3>
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Status</th>
                      <th className="px-4 py-2 border-b">Order Number</th>
                      <th className="px-4 py-2 border-b">Supplier Name</th>
                      <th className="px-4 py-2 border-b">Supplier Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="px-4 py-2 border-b">{req.status}</td>
                        <td className="px-4 py-2 border-b">{req.orderNumber}</td>
                        <td className="px-4 py-2 border-b">{req.supplierName}</td>
                        <td className="px-4 py-2 border-b">{req.supplierNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserInquiryDashboard;
