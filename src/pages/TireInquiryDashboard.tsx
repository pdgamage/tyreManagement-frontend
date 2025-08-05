import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import { ArrowLeft, AlertCircle, Loader2, X, Search, Car, Building, FileText, ChevronDown, ChevronUp, Filter, Frown, Smile, CheckCircle, Clock, XCircle, Package } from "lucide-react";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  brand: string;
  model: string;
}

interface TireRequest {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  requestDate: string;
  created_at?: string;
  submittedAt?: string;
  supplierName?: string;
  tireCount?: number;
}

const statusOptions = [
  { value: "all", label: "All Statuses", icon: null },
  { value: "pending", label: "Pending", icon: <Clock className="w-4 h-4 mr-2 text-yellow-500" /> },
  { value: "approved", label: "Approved", icon: <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> },
  { value: "rejected", label: "Rejected", icon: <XCircle className="w-4 h-4 mr-2 text-red-500" /> },
  { value: "complete", label: "Complete - Engineer Approved", icon: <Smile className="w-4 h-4 mr-2 text-blue-500" /> },
];

const UserInquiryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle') || '';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleFromUrl);
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TireRequest[]>([]);
  const [isLoading, setIsLoading] = useState({ vehicles: false, requests: false });
  const [error, setError] = useState({ vehicles: '', requests: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  // Local state for date filter inputs
  const [dateInput, setDateInput] = useState({ startDate: '', endDate: '' });
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  const fetchVehicles = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, vehicles: true }));
    setError(prev => ({ ...prev, vehicles: '' }));
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VEHICLES}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch vehicles: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Expected an array of vehicles but received something else');
      }
      setVehicles(data);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      setError(prev => ({ 
        ...prev, 
        vehicles: `Failed to load vehicles: ${err?.message || 'Unknown error'}` 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, vehicles: false }));
    }
  }, []);

  const fetchRequests = useCallback(async (vehicleNumber: string) => {
    if (!vehicleNumber) {
      setRequests([]);
      setFilteredRequests([]);
      return;
    }
    
    setIsLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: '' }));
    
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}/vehicle/${encodeURIComponent(vehicleNumber)}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      const requestsData = Array.isArray(result.data) ? result.data : [];
      
      const formattedRequests = requestsData.map((req: any) => ({
        id: req.id?.toString() || '',
        vehicleNumber: req.vehicleNumber || '',
        status: req.status || 'unknown',
        orderNumber: req.orderNumber || 'The order has not yet been placed with a supplier',
        requestDate: req.requestDate || req.submittedAt || new Date().toISOString(),
        submittedAt: req.submittedAt,
        supplierName: req.supplierName || 'The order has not yet been placed with a supplier',
        tireCount: req.tireCount || 0,
      }));
      
      setRequests(formattedRequests);
      setFilteredRequests(formattedRequests);
      
      if (formattedRequests.length === 0) {
        setError(prev => ({ ...prev, requests: 'No requests found for this vehicle' }));
      } else {
        setError(prev => ({ ...prev, requests: '' }));
      }
      
    } catch (err: any) {
      console.error('Error in fetchRequests:', err);
      setError(prev => ({ 
        ...prev, 
        requests: `Failed to load requests: ${err?.message || 'Unknown error'}` 
      }));
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (vehicleFromUrl) {
      setSelectedVehicle(vehicleFromUrl);
      fetchRequests(vehicleFromUrl);
    }
  }, [vehicleFromUrl, fetchRequests]);

  // Fetch all requests on initial load
  const fetchAllRequests = useCallback(async () => {
    try {
      setIsLoading(prev => ({ ...prev, requests: true }));
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError(prev => ({
        ...prev,
        requests: `Failed to load requests: ${err?.message || 'Unknown error'}`
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, []);

  // Fetch requests for a specific vehicle
  const fetchVehicleRequests = useCallback(async (vehicleNumber: string) => {
    if (!vehicleNumber) {
      await fetchAllRequests();
      return;
    }
    
    try {
      setIsLoading(prev => ({ ...prev, requests: true }));
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}/vehicle/${encodeURIComponent(vehicleNumber)}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch vehicle requests: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching vehicle requests:', err);
      setError(prev => ({
        ...prev,
        requests: `Failed to load vehicle requests: ${err?.message || 'Unknown error'}`
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, [fetchAllRequests]);

  // Handle vehicle selection changes
  useEffect(() => {
    if (selectedVehicle) {
      fetchVehicleRequests(selectedVehicle);
    } else {
      fetchAllRequests();
    }
  }, [selectedVehicle, fetchVehicleRequests, fetchAllRequests]);

  // Apply filters to the requests
  useEffect(() => {
    if (!requests.length) return;
    
    let results = [...requests];

    // Apply date range filter if dates are selected
    if (dateRange.startDate || dateRange.endDate) {
      try {
        const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
        
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        
        console.log('Filtering by date range:', { start, end });
        
        results = results.filter(request => {
          if (!request.submittedAt) return false;
          
          try {
            const requestDate = new Date(request.submittedAt);
            if (isNaN(requestDate.getTime())) {
              console.log('Invalid request date:', request.submittedAt);
              return false;
            }
            
            if (start && requestDate < start) {
              console.log('Before start date:', requestDate, start);
              return false;
            }
            if (end && requestDate > end) {
              console.log('After end date:', requestDate, end);
              return false;
            }
            
            console.log('Date within range:', requestDate);
            return true;
          } catch (error) {
            console.error('Error processing date:', request.submittedAt, error);
            return false;
          }
        });
      } catch (error) {
        console.error('Error in date range filtering:', error);
      }
    }
    
    // Apply status filter to either vehicle or date filtered results
    if (statusFilter !== "all") {
      results = results.filter(request => 
        request.status.toLowerCase().includes(statusFilter)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(request => 
        (request.orderNumber?.toLowerCase().includes(term) ?? false) || 
        (request.id?.toLowerCase().includes(term) ?? false) ||
        (request.supplierName?.toLowerCase().includes(term) ?? false)
      );
    }
    
    setFilteredRequests(results);
  }, [requests, dateRange.startDate, dateRange.endDate, statusFilter, searchTerm, selectedVehicle]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedVehicle(value);
    navigate(value ? `?vehicle=${value}` : '/user/inquiry-dashboard');
    if (value) fetchRequests(value);
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/user/request-details/${requestId}`, {
      state: { fromInquiry: true }
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending')) return 'bg-yellow-50 text-yellow-800 border-yellow-100';
    if (statusLower.includes('approved') || statusLower === 'complete') return 'bg-green-50 text-green-800 border-green-100';
    if (statusLower.includes('rejected')) return 'bg-red-50 text-red-800 border-red-100';
    return 'bg-gray-50 text-gray-800 border-gray-100';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending')) return <Clock className="w-4 h-4 mr-1.5 text-yellow-500" />;
    if (statusLower.includes('approved')) return <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />;
    if (statusLower.includes('complete')) return <Smile className="w-4 h-4 mr-1.5 text-blue-500" />;
    if (statusLower.includes('rejected')) return <XCircle className="w-4 h-4 mr-1.5 text-red-500" />;
    return <FileText className="w-4 h-4 mr-1.5 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Inquiry Dashboard</h1>
                <p className="text-blue-100 opacity-90">Track and manage your tire requests and inquiries</p>
              </div>
            </div>
          </div>
          
          {/* Combined Filters Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Selection Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-blue-100">
                  Filter by Vehicle
                </label>
                {isLoading.vehicles && (
                  <div className="flex items-center text-xs text-blue-200">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Loading...
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Car className="h-4 w-4 text-blue-400" />
                  </div>
                  <select
                    value={selectedVehicle}
                    onChange={handleVehicleChange}
                    className="block w-full pl-10 pr-10 py-2.5 text-sm border border-blue-300/50 rounded-lg bg-white/90 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    disabled={isLoading.vehicles}
                  >
                    <option value="">All Vehicles</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.vehicleNumber} value={vehicle.vehicleNumber}>
                        {vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model}
                      </option>
                    ))}
                  </select>
                  {selectedVehicle && (
                    <button
                      onClick={() => {
                        setSelectedVehicle('');
                        navigate('/user/inquiry-dashboard');
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-white transition-colors"
                      title="Clear selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {error.vehicles && (
                <div className="mt-2 text-xs text-red-200 flex items-start">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{error.vehicles}</span>
                </div>
              )}
            </div>
            
            {/* Date Range Filter */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-blue-100">
                  Filter by Date Range
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-blue-200 mb-1">From</label>
                  <input
                    type="date"
                    value={dateInput.startDate}
                    onChange={(e) => setDateInput({...dateInput, startDate: e.target.value})}
                    className="block w-full px-3 py-2 border border-blue-300/50 rounded-lg bg-white/90 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-blue-200 mb-1">To</label>
                  <input
                    type="date"
                    value={dateInput.endDate}
                    onChange={(e) => setDateInput({...dateInput, endDate: e.target.value})}
                    min={dateInput.startDate}
                    className="block w-full px-3 py-2 border border-blue-300/50 rounded-lg bg-white/90 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => setDateRange({ startDate: dateInput.startDate, endDate: dateInput.endDate })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                    disabled={!dateInput.startDate && !dateInput.endDate}
                    title="Apply date range filter"
                  >
                    Apply
                  </button>
                  {(dateRange.startDate || dateRange.endDate) && (
                    <button
                      onClick={() => { 
                        setDateRange({ startDate: '', endDate: '' }); 
                        setDateInput({ startDate: '', endDate: '' }); 
                      }}
                      className="px-4 py-2 text-xs text-blue-200 hover:text-white transition-colors duration-200"
                      title="Clear date range"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status and Search Filters */}
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Filter by Status
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="relative w-full bg-white/90 border border-blue-300/50 rounded-lg shadow-sm pl-3 pr-10 py-2.5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    >
                      <span className="flex items-center">
                        {statusOptions.find(opt => opt.value === statusFilter)?.icon}
                        {statusOptions.find(opt => opt.value === statusFilter)?.label || 'Select status...'}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        {isStatusDropdownOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </span>
                    </button>
                    
                    {isStatusDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                        <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {statusOptions.map((option) => (
                            <li
                              key={option.value}
                              className={`text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${statusFilter === option.value ? 'bg-blue-100' : ''}`}
                              onClick={() => {
                                setStatusFilter(option.value);
                                setIsStatusDropdownOpen(false);
                              }}
                            >
                              <div className="flex items-center">
                                <span className="font-normal block truncate">
                                  {option.icon}
                                  {option.label}
                                </span>
                              </div>
                              {statusFilter === option.value && (
                                <span className="text-blue-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                  <CheckCircle className="h-5 w-5" />
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Search Filter */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-blue-100 mb-2">
                    Search Requests
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      className="focus:ring-blue-400 focus:border-blue-400 block w-full pl-10 pr-12 sm:text-sm border-blue-300/50 rounded-lg bg-white/90 text-gray-900 shadow-sm"
                      placeholder="Search by order #, ID, or supplier"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">

        {/* Dashboard Stats (only shown when vehicle is selected) */}
        {selectedVehicle && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Requests</p>
                  <p className="text-2xl font-semibold text-gray-900">{requests.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {requests.filter(r => r.status.toLowerCase().includes('pending')).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {requests.filter(r => r.status.toLowerCase().includes('approved')).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-50 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Complete</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {requests.filter(r => r.status.toLowerCase().includes('complete')).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                  <Smile className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {requests.filter(r => r.status.toLowerCase().includes('rejected')).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-50 text-red-600">
                  <XCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section (only shown when vehicle is selected) */}
        {selectedVehicle && (
          <div className="mb-6 bg-white rounded-xl shadow-md p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filter Requests
            </h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by order #, request ID, or supplier..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <div className="relative">
                  <button
                    type="button"
                    className="inline-flex items-center justify-between w-full md:w-56 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  >
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-2 text-gray-500" />
                      {statusOptions.find(opt => opt.value === statusFilter)?.label || "Filter by status"}
                    </div>
                    {isStatusDropdownOpen ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </button>
                  
                  {isStatusDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                              statusFilter === option.value
                                ? "bg-blue-50 text-blue-800"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              setStatusFilter(option.value);
                              setIsStatusDropdownOpen(false);
                            }}
                          >
                            {option.icon}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <div className="relative">
                    <button
                      type="button"
                      className={`inline-flex items-center px-4 py-2.5 border rounded-lg text-sm font-medium ${
                        showDateFilter || dateRange.startDate || dateRange.endDate
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setShowDateFilter(!showDateFilter)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {dateRange.startDate || dateRange.endDate ? (
                        <span className="text-sm">
                          {dateRange.startDate ? new Date(dateRange.startDate).toLocaleDateString() : ''} - {dateRange.endDate ? new Date(dateRange.endDate).toLocaleDateString() : 'Now'}
                        </span>
                      ) : (
                        <span>Date Range</span>
                      )}
                    </button>
                    {showDateFilter && (
                      <div className="absolute z-10 mt-1 p-4 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                            <input
                              type="date"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              value={dateRange.startDate}
                              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                            <input
                              type="date"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              value={dateRange.endDate}
                              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                              min={dateRange.startDate}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {(searchTerm || statusFilter !== "all" || dateRange.startDate || dateRange.endDate) && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setDateRange({ startDate: '', endDate: '' });
                      }}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Reset All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Loading State */}
          {isLoading.requests && (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-white rounded-xl shadow">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading requests for {selectedVehicle}...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading.requests && error.requests && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-red-50">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-red-800">Error loading requests</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{error.requests}</p>
                    </div>
                    <button
                      onClick={() => fetchRequests(selectedVehicle)}
                      className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading.requests && !error.requests && filteredRequests.length === 0 && selectedVehicle && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Frown className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No matching requests found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {(searchTerm || statusFilter !== "all")
                    ? "We couldn't find any requests matching your criteria. Try adjusting your filters."
                    : `No tire requests were found for vehicle ${selectedVehicle}.`}
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Initial State - No vehicle selected */}
          {!isLoading.requests && !selectedVehicle && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                  <Car className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No vehicle selected</h3>
                <p className="text-gray-500">Select a vehicle from the dropdown above to view its tire requests and inquiries.</p>
              </div>
            </div>
          )}

          {/* Requests List */}
          {!isLoading.requests && !error.requests && filteredRequests.length > 0 && (
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Requests for <span className="font-semibold text-blue-600">{selectedVehicle}</span>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Showing {filteredRequests.length} of {requests.length} request{requests.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                    <span className="hidden sm:inline mr-2">Sorted by:</span>
                    <span className="font-medium">Most Recent</span>
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <li 
                    key={request.id} 
                    className="group px-6 py-5 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-l-4 border-transparent hover:border-blue-500"
                    onClick={() => handleViewDetails(request.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Request #{request.id}
                              </h3>
                              <div className="text-sm text-gray-500 mt-1">
                                Submitted on {formatDate(request.requestDate)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(request.status)} border flex items-center shadow-sm`}>
                              {getStatusIcon(request.status)}
                              {request.status.toLowerCase() === 'complete' ? 'Complete - Engineer Approved' : request.status}
                            </span>
                            {request.status.toLowerCase() === 'complete' && (
                              <p className="text-sm text-gray-600 italic flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />
                                The order has been sent to the customer officer 
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-4">
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg group-hover:bg-white">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Order Number</p>
                              <p className="text-sm font-medium text-gray-900">
                                {request.orderNumber === 'The order has not yet been placed with a supplier' 
                                  ? <span className="italic text-gray-500">{request.orderNumber}</span>
                                  : `#${request.orderNumber}`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg group-hover:bg-white">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                              <Building className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Supplier</p>
                              <p className="text-sm font-medium text-gray-900">
                                {request.supplierName === 'The order has not yet been placed with a supplier'
                                  ? <span className="italic text-gray-500">{request.supplierName}</span>
                                  : request.supplierName}
                              </p>
                            </div>
                          </div>
                          
                          {(request.tireCount ?? 0) > 0 && (
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg group-hover:bg-white">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                <Package className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Tires Requested</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {request.tireCount} tire{request.tireCount !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-6 md:flex-shrink-0 flex items-center">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 group-hover:shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(request.id);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserInquiryDashboard;