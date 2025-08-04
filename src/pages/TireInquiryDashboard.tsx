import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrls, API_CONFIG } from "../config/api";
import { 
  FileText, 
  ArrowLeft, 
  Search, 
  Car, 
  Package, 
  User, 
  AlertCircle,
  Loader2,
  Calendar,
  Filter
} from "lucide-react";

// Constants
const STATUS_MESSAGES = {
  LOADING: "Loading...",
  NO_VEHICLE: "Please select a vehicle",
  NO_REQUESTS: "No requests found for this vehicle",
  ERROR: "An error occurred while fetching data"
};

interface Vehicle {
  id: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  registrationNumber?: string;
}

interface TireRequest {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  requestDate: string;
  supplierDetails: {
    name: string;
    phone: string;
    email: string;
  };
  tireDetails: {
    size: string;
    quantity: number;
    tubesQuantity: number;
    reason: string;
    make: string;
  };
  vehicleDetails: {
    brand: string;
    model: string;
    lastReplacement: string;
    kmReading: {
      current: number;
      previous: number;
    };
  };
  requesterDetails: {
    name: string;
    department: string;
    costCenter: string;
  };
  approvalNotes: {
    supervisor?: string;
    technicalManager?: string;
    engineer?: string;
    customerOfficer?: string;
  };
  quantity?: number;
  tubesQuantity?: number;
  requestReason?: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  lastReplacementDate?: string;
  existingTireMake?: string;
  presentKmReading?: number;
  previousKmReading?: number;
  tireWearPattern?: string;
  userSection?: string;
  costCenter?: string;
  supervisor_notes?: string;
  technical_manager_note?: string;
  engineer_note?: string;
  customer_officer_note?: string;
  [key: string]: any;
}

interface RequestDetail extends TireRequest {
  created_at?: string;
  submittedAt?: string;
}

const TireInquiryDashboard: React.FC = () => {
  const navigate = useNavigate();

  // State for vehicle selection and data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [requests, setRequests] = useState<TireRequest[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState({
    vehicles: false,
    requests: false
  });
  const [error, setError] = useState<{
    vehicles?: string;
    requests?: string;
  }>({});

  // Report states and loading
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [reportResults, setReportResults] = useState<RequestDetail[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Handle view details click
  const handleViewDetails = useCallback((requestId: string) => {
    window.location.href = `/request/${requestId}`;
  }, []);

  // Fetch vehicles function
  const fetchVehicles = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, vehicles: true }));
    setError(prev => ({ ...prev, vehicles: undefined }));

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/vehicles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(response.status === 404 ? 'No vehicles found' : 'Failed to fetch vehicles');
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setVehicles(data.map(vehicle => ({
        id: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        brand: vehicle.brand || 'Unknown',
        model: vehicle.model || 'Unknown',
        registrationNumber: vehicle.registrationNumber
      })));
    } catch (err) {
      setError(prev => ({
        ...prev,
        vehicles: err instanceof Error ? err.message : 'Failed to load vehicles'
      }));
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, vehicles: false }));
    }
  }, []);

  // Fetch requests function
  const fetchRequests = useCallback(async (vehicleNumber: string) => {
    if (!vehicleNumber) return;

    setIsLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: undefined }));
    setRequests([]);

    try {
      console.log('Fetching requests for vehicle:', vehicleNumber);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/requests/by-vehicle/${encodeURIComponent(vehicleNumber)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 404) {
        setRequests([]);
        throw new Error('No requests found for this vehicle');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setRequests(data.map(request => ({
        id: request.id,
        vehicleNumber: request.vehicleNumber,
        status: request.status || 'Pending',
        orderNumber: request.orderNumber || 'Not Assigned',
        requestDate: request.created_at || request.submittedAt,
        supplierDetails: {
          name: request.supplierName || 'Not Assigned',
          phone: request.supplierPhone || 'Not Available',
          email: request.supplierEmail || 'Not Available'
        },
        tireDetails: {
          size: request.tireSize || request.tireSizeRequired || 'Not Specified',
          quantity: request.quantity || 0,
          tubesQuantity: request.tubesQuantity || 0,
          reason: request.requestReason || 'Not Specified',
          make: request.existingTireMake || 'Not Specified'
        },
        vehicleDetails: {
          brand: request.vehicleBrand || 'Unknown',
          model: request.vehicleModel || 'Unknown',
          lastReplacement: request.lastReplacementDate || 'Not Available',
          kmReading: {
            current: request.presentKmReading || 0,
            previous: request.previousKmReading || 0
          }
        },
        requesterDetails: {
          name: request.requesterName || 'Not Specified',
          department: request.userSection || 'Not Specified',
          costCenter: request.costCenter || 'Not Specified'
        },
        approvalNotes: {
          supervisor: request.supervisor_notes,
          technicalManager: request.technical_manager_note,
          engineer: request.engineer_note,
          customerOfficer: request.customer_officer_note
        }
      })));
    } catch (err) {
      setError(prev => ({
        ...prev,
        requests: err instanceof Error ? err.message : 'Failed to fetch requests'
      }));
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, []);

  // Initial fetch of vehicles
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Fetch requests when vehicle is selected
  useEffect(() => {
    if (selectedVehicle) {
      fetchRequests(selectedVehicle);
    } else {
      setRequests([]);
      setError(prev => ({ ...prev, requests: undefined }));
    }
  }, [selectedVehicle, fetchRequests]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "complete":
      case "order placed":
        return "bg-green-100 text-green-800";
      case "supervisor approved":
      case "technical-manager approved":
      case "engineer approved":
      case "customer-officer approved":
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "supervisor rejected":
      case "technical-manager rejected":
      case "engineer rejected":
      case "customer-officer rejected":
      case "rejected":
        return "bg-red-100 text-red-800";
      case "order cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch requests for report (date range)
  const handleReportSearch = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    setError({});
    try {
      const url = `${API_CONFIG.BASE_URL}/api/requests/report?from=${dateFrom}&to=${dateTo}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch report data');
      const data = await res.json();
      
      // Filter by date range on frontend as well
      const filteredData = data.filter((req: RequestDetail) => {
        const requestDate = new Date(req.created_at || req.submittedAt || '');
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        return requestDate >= fromDate && requestDate <= toDate;
      }).map((request: RequestDetail) => ({
        ...request,
        id: request.id,
        vehicleNumber: request.vehicleNumber,
        status: request.status || 'Pending',
        orderNumber: request.orderNumber || 'Not Assigned',
        requestDate: request.created_at || request.submittedAt,
        supplierDetails: {
          name: request.supplierName || 'Not Assigned',
          phone: request.supplierPhone || 'Not Available',
          email: request.supplierEmail || 'Not Available'
        },
        tireDetails: {
          size: request.tireSize || request.tireSizeRequired || 'Not Specified',
          quantity: request.quantity || 0,
          tubesQuantity: request.tubesQuantity || 0,
          reason: request.requestReason || 'Not Specified',
          make: request.existingTireMake || 'Not Specified'
        },
        vehicleDetails: {
          brand: request.vehicleBrand || 'Unknown',
          model: request.vehicleModel || 'Unknown',
          lastReplacement: request.lastReplacementDate || 'Not Available',
          kmReading: {
            current: request.presentKmReading || 0,
            previous: request.previousKmReading || 0
          }
        },
        requesterDetails: {
          name: request.requesterName || 'Not Specified',
          department: request.userSection || 'Not Specified',
          costCenter: request.costCenter || 'Not Specified'
        }
      }));
      
      setReportResults(Array.isArray(filteredData) ? filteredData : []);
      
      if (filteredData.length === 0) {
        setError({ requests: "No requests found for the selected date range" });
      }
    } catch (err) {
      setError({ requests: "Failed to fetch report data" });
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "complete":
      case "order placed":
        return "bg-green-100 text-green-800";
      case "supervisor approved":
      case "technical-manager approved":
      case "engineer approved":
      case "customer-officer approved":
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "supervisor rejected":
      case "technical-manager rejected":
      case "engineer rejected":
      case "customer-officer rejected":
      case "rejected":
        return "bg-red-100 text-red-800";
      case "order cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-indigo-700 shadow-sm border-b border-gray-200">
        <div className="px-4 py-8 mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Tire Inquiry Dashboard</h1>
              <p className="text-slate-200 text-base font-medium mt-1">Search and report on tire requests by vehicle</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/user")}
            className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="px-4 py-8 mx-auto max-w-7xl">
        {/* Vehicle Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Vehicle Selection</h2>
              <p className="text-sm text-gray-500">Select a vehicle to view its tire requests</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                disabled={isLoading.vehicles}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.vehicleNumber}>
                    {vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1 flex items-end">
              <button
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center space-x-2"
                onClick={() => selectedVehicle && fetchRequests(selectedVehicle)}
                disabled={!selectedVehicle || isLoading.requests}
              >
                {isLoading.requests ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{isLoading.requests ? "Searching..." : "Search"}</span>
              </button>
            </div>
          </div>

          {/* Error Messages */}
          {(error.vehicles || error.requests) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                {error.vehicles && <p className="text-red-700">{error.vehicles}</p>}
                {error.requests && <p className="text-red-700">{error.requests}</p>}
              </div>
            </div>
          )}

          {/* Results Section */}
              <div className="mt-6 space-y-6">
                {requests.map(req => (
                  <div key={req.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Request Information */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">Request #{req.id}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Number</label>
                            <p className="text-sm font-semibold text-gray-900">{req.orderNumber || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Requested Date</label>
                            <p className="text-sm font-semibold text-gray-900">{formatDate(req.created_at || req.submittedAt)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tire Size</label>
                            <p className="text-sm font-semibold text-gray-900">{req.tireSize || req.tireSizeRequired || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
                            <p className="text-sm font-semibold text-gray-900">{req.quantity || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tubes Quantity</label>
                            <p className="text-sm font-semibold text-gray-900">{req.tubesQuantity || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Request Reason</label>
                            <p className="text-sm font-semibold text-gray-900">{req.requestReason || "-"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Supplier & Vehicle Information */}
                      <div className="space-y-4">
                        <h5 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span>Supplier Information</span>
                        </h5>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Supplier Name</label>
                            <p className="text-sm font-semibold text-gray-900">{req.supplierName || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Supplier Phone</label>
                            <p className="text-sm font-semibold text-gray-900">{req.supplierPhone || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Supplier Email</label>
                            <p className="text-sm font-semibold text-gray-900">{req.supplierEmail || "-"}</p>
                          </div>
                        </div>

                        <h5 className="text-md font-semibold text-gray-900 flex items-center space-x-2 mt-6">
                          <User className="w-4 h-4" />
                          <span>Requester Information</span>
                        </h5>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Requester Name</label>
                            <p className="text-sm font-semibold text-gray-900">{req.requesterName || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</label>
                            <p className="text-sm font-semibold text-gray-900">{req.userSection || "-"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cost Center</label>
                            <p className="text-sm font-semibold text-gray-900">{req.costCenter || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h5 className="text-md font-semibold text-gray-900 mb-4">Additional Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle Brand</label>
                          <p className="text-sm font-semibold text-gray-900">{req.vehicleBrand || "-"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle Model</label>
                          <p className="text-sm font-semibold text-gray-900">{req.vehicleModel || "-"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Replacement</label>
                          <p className="text-sm font-semibold text-gray-900">{req.lastReplacementDate || "-"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Existing Tire Make</label>
                          <p className="text-sm font-semibold text-gray-900">{req.existingTireMake || "-"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Present KM Reading</label>
                          <p className="text-sm font-semibold text-gray-900">{req.presentKmReading || "-"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Previous KM Reading</label>
                          <p className="text-sm font-semibold text-gray-900">{req.previousKmReading || "-"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {(req.supervisor_notes || req.technical_manager_note || req.engineer_note || req.customer_officer_note) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h5 className="text-md font-semibold text-gray-900 mb-4">Review Notes</h5>
                        <div className="space-y-3">
                          {req.supervisor_notes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <label className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Supervisor Notes</label>
                              <p className="text-sm text-yellow-800 mt-1">{req.supervisor_notes}</p>
                            </div>
                          )}
                          {req.technical_manager_note && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Technical Manager Notes</label>
                              <p className="text-sm text-blue-800 mt-1">{req.technical_manager_note}</p>
                            </div>
                          )}
                          {req.engineer_note && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <label className="text-xs font-medium text-green-700 uppercase tracking-wide">Engineer Notes</label>
                              <p className="text-sm text-green-800 mt-1">{req.engineer_note}</p>
                            </div>
                          )}
                          {req.customer_officer_note && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <label className="text-xs font-medium text-purple-700 uppercase tracking-wide">Customer Officer Notes</label>
                              <p className="text-sm text-purple-800 mt-1">{req.customer_officer_note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedVehicle && !loading && (
            <div className="mt-6">
              {requests.length > 0 ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Requests for Vehicle: {selectedVehicle}
                  </h3>
                  <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order #
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tire Details
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Supplier
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{request.orderNumber}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">{formatDate(request.requestDate)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">Size: {request.tireDetails.size}</div>
                              <div className="text-sm text-gray-500">Qty: {request.tireDetails.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{request.supplierDetails.name}</div>
                              <div className="text-sm text-gray-500">{request.supplierDetails.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => window.location.href = `/request/${request.id}`}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg mb-2">No requests found</p>
                  <p className="text-gray-400 text-sm">No tire requests have been made for vehicle {selectedVehicle}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Report Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-900">Request Report by Date Range</h2>
              <p className="text-green-700 text-sm">Filter and view all tire requests within a specific date range</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <button
              onClick={handleReportSearch}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:shadow-lg transition-all flex items-center space-x-2"
              disabled={!dateFrom || !dateTo || loading}
            >
              <Filter className="w-4 h-4" />
              <span>{loading ? "Filtering..." : "Generate Report"}</span>
            </button>
          </div>

          {reportResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Report Results ({reportResults.length} requests found)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Request ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Vehicle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Requested Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Tire Size</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide">Requester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportResults.map(request => (
                      <tr key={request.id} className="border-t border-gray-100 hover:bg-green-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">#{request.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.vehicleNumber}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.orderNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.supplierDetails.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(request.requestDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.tireDetails.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.tireDetails.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.requesterDetails.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dateFrom && dateTo && reportResults.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2">No requests found</p>
              <p className="text-gray-400 text-sm">No tire requests were made between {dateFrom} and {dateTo}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TireInquiryDashboard;