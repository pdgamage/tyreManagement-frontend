import { useState, useEffect } from 'react';
import { Search, FileText, Calendar } from 'lucide-react';
import { useRequests } from '../contexts/RequestContext';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TireInquiryDashboard = () => {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [vehicleNumbers, setVehicleNumbers] = useState<string[]>([]);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateRangeRequests, setDateRangeRequests] = useState<any[]>([]);
  const { requests } = useRequests();

  useEffect(() => {
    // Extract unique vehicle numbers from requests
    const uniqueVehicles = [...new Set(requests.map(req => req.vehicleNumber))];
    setVehicleNumbers(uniqueVehicles);
  }, [requests]);

  const handleSearch = () => {
    const details = requests.find(req => req.vehicleNumber === selectedVehicle);
    setRequestDetails(details);
  };

  const handleDateRangeSearch = () => {
    if (startDate && endDate) {
      const filteredRequests = requests.filter(req => {
        const requestDate = new Date(req.submittedAt);
        return requestDate >= startDate && requestDate <= endDate;
      });
      setDateRangeRequests(filteredRequests);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Tire Inquiry Dashboard</h1>
                <p className="text-blue-100">Search and view tire request details by vehicle</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Search Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Search</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Vehicle Number
                  </label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicleNumbers.map((number) => (
                      <option key={number} value={number}>{number}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>

              {requestDetails && (
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Request Status</h3>
                    <p className="text-lg font-semibold text-gray-900">{requestDetails.status}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Order Number</h3>
                    <p className="text-lg font-semibold text-gray-900">{requestDetails.orderNumber || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Supplier Name</h3>
                    <p className="text-lg font-semibold text-gray-900">{requestDetails.supplierName || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Supplier Number</h3>
                    <p className="text-lg font-semibold text-gray-900">{requestDetails.supplierNumber || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Request Date</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(requestDetails.submittedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Date Range Report</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      dateFormat="MMM dd, yyyy"
                      placeholderText="Select start date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      dateFormat="MMM dd, yyyy"
                      placeholderText="Select end date"
                    />
                  </div>
                </div>
                <button
                  onClick={handleDateRangeSearch}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Generate Report</span>
                </button>
              </div>

              {dateRangeRequests.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Requests ({dateRangeRequests.length})
                  </h3>
                  <div className="space-y-4">
                    {dateRangeRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Vehicle Number</p>
                            <p className="text-base font-semibold text-gray-900">{request.vehicleNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <p className="text-base font-semibold text-gray-900">{request.status}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Request Date</p>
                            <p className="text-base font-semibold text-gray-900">
                              {format(new Date(request.submittedAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Order Number</p>
                            <p className="text-base font-semibold text-gray-900">{request.orderNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TireInquiryDashboard;
