import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API_CONFIG } from "../config/api";
import "../styles/scrollbar.css";
import { ArrowLeft, AlertCircle, Loader2, X, Search, Car, Building, FileText, ChevronDown, ChevronUp, Filter, Frown, Smile, CheckCircle, Clock, XCircle, Package, FileDown } from "lucide-react";
import { exportToExcel } from "../utils/exportToExcel";

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

// Helper function to format dates in the format 'DD MMM YYYY, hh:mm A'
const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'Date not available';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};

const statusOptions = [
  { value: "all", label: "All Statuses", icon: null },
  { value: "pending", label: "Pending", icon: <Clock className="w-4 h-4 mr-2 text-yellow-500" /> },
  { value: "approved", label: "Approved", icon: <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> },
  { value: "order placed", label: "Order Placed", icon: <Package className="w-4 h-4 mr-2 text-purple-500" /> },
  { value: "rejected", label: "Rejected", icon: <XCircle className="w-4 h-4 mr-2 text-red-500" /> },
  { value: "complete", label: "Complete - Engineer Approved", icon: <Smile className="w-4 h-4 mr-2 text-blue-500" /> },
];

const UserInquiryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle') || '';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  // Initialize selectedVehicle with empty string to show no requests by default
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleFromUrl || '');
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TireRequest[]>([]);
  const [isLoading, setIsLoading] = useState({ vehicles: false, requests: false });
  const [error, setError] = useState<{ vehicles: string | null; requests: string | null }>({ vehicles: null, requests: null });
  
  // Handle error state updates safely
  const updateError = useCallback((field: 'vehicles' | 'requests', message: string) => {
    setError(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

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

  const fetchRequests = useCallback(async (vehicleNumber?: string) => {
    setIsLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: '' }));
    
    try {
      const url = vehicleNumber 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}?vehicleNumber=${encodeURIComponent(vehicleNumber)}`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}`;

      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
      updateError('requests', '');
    } catch (err: unknown) {
      console.error('Error fetching vehicle requests:', err);
      updateError('requests', `Failed to load vehicle requests: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Initialize requests based on URL parameter or default to empty
  useEffect(() => {
    if (vehicleFromUrl) {
      // If there's a vehicle in the URL, select it and fetch its requests
      setSelectedVehicle(vehicleFromUrl);
      fetchRequests(vehicleFromUrl);
    } else {
      // If no vehicle in URL, ensure we start with no requests
      setRequests([]);
    }
  }, [vehicleFromUrl, fetchRequests]);

  // Fetch all requests
  const fetchAllRequests = useCallback(async (vehicleNumber?: string) => {
    try {
      setIsLoading(prev => ({ ...prev, requests: true }));
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}`;
      if (vehicleNumber && vehicleNumber !== '') {
        url += `?vehicleNumber=${encodeURIComponent(vehicleNumber)}`;
      }
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
      updateError('requests', '');
    } catch (err: unknown) {
      console.error('Error fetching requests:', err);
      updateError('requests', `Failed to load requests: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }
  }, []);

  // Apply filters to the requests
  useEffect(() => {
    if (!requests || !Array.isArray(requests)) {
      console.log('No requests or invalid requests array');
      setFilteredRequests([]);
      return;
    }
    
    console.log('Applying filters to requests:', requests.length, 'requests');
    console.log('Current filters - search:', searchTerm, 'status:', statusFilter, 'vehicle:', selectedVehicle, 'dateRange:', dateRange);
    
    // Apply all filters in sequence
    const filtered = [...requests].filter(request => {
      // Skip if request is invalid
      if (!request || typeof request !== 'object') return false;
      
      // Apply vehicle filter
      if (selectedVehicle === 'Select Vehicle') {
        // Show no requests when 'Select Vehicle' is selected
        return false;
      } else if (selectedVehicle && selectedVehicle !== 'All Vehicles' && request.vehicleNumber !== selectedVehicle) {
        // When a specific vehicle is selected, only show matching requests
        console.log('Filtering out request - vehicle mismatch:', request.id, request.vehicleNumber, '!==', selectedVehicle);
        return false;
      }
      
      // Apply date range filter if dates are selected
      if (dateRange.startDate || dateRange.endDate) {
        try {
          const requestDate = request.submittedAt || request.requestDate || request.created_at;
          if (!requestDate) return false; // Skip if no date available
          
          const requestDateObj = new Date(requestDate);
          if (isNaN(requestDateObj.getTime())) {
            console.log('Skipping request due to invalid date:', request.id, requestDate);
            return false;
          }
          
          // Normalize to local date (ignoring time)
          const requestDateLocal = new Date(
            requestDateObj.getFullYear(),
            requestDateObj.getMonth(),
            requestDateObj.getDate()
          );
          
          // Handle start date filter
          if (dateRange.startDate) {
            const [year, month, day] = dateRange.startDate.split('-').map(Number);
            const startDate = new Date(year, month - 1, day);
            
            if (requestDateLocal < startDate) {
              return false;
            }
          }
          
          // Handle end date filter
          if (dateRange.endDate) {
            const [year, month, day] = dateRange.endDate.split('-').map(Number);
            const endDate = new Date(year, month - 1, day + 1); // Include the entire end date
            
            if (requestDateLocal >= endDate) {
              return false;
            }
          }
          
        } catch (error) {
          console.error('Error processing date filter:', error, 'Request ID:', request.id);
          return false;
        }
      }
      
      // 2. Apply status filter
      if (statusFilter !== "all") {
        const requestStatus = (request.status || '').toLowerCase();
        const statusFilterLower = statusFilter.toLowerCase();
        
        // Special handling for 'order placed' status which might have variations
        if (statusFilterLower === 'order placed' || statusFilterLower === 'place order') {
          if (!requestStatus.includes('order placed') && !requestStatus.includes('place order')) {
            return false;
          }
        } 
        // Standard status filter for other statuses
        else if (!requestStatus.includes(statusFilterLower)) {
          return false;
        }
      }
      
      // 3. Apply search term filter
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const orderNumber = (request.orderNumber || '').toString().toLowerCase();
        const id = (request.id || '').toString().toLowerCase();
        const supplierName = (request.supplierName || '').toString().toLowerCase();
        
        // Check if any field contains the search term
        const matchesSearch = 
          orderNumber.includes(term) || 
          id.includes(term) || 
          supplierName.includes(term);
          
        if (!matchesSearch) {
          return false;
        }
      }
      
      return true; // Include request if it passes all filters
    });
    
    console.log('Filtered requests:', filtered.length, 'out of', requests.length);
    setFilteredRequests(filtered);
    
  }, [requests, selectedVehicle, dateRange.startDate, dateRange.endDate, statusFilter, searchTerm]);

  // Handle search input changes and update URL
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update URL with search term for shareable links
    const searchParams = new URLSearchParams(window.location.search);
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    // Use replace to avoid adding to browser history for each keystroke
    window.history.replaceState({}, '', `?${searchParams.toString()}`);
  };

  // Handle vehicle selection changes
  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedVehicle(value);
    
    // Update URL with the new vehicle selection
    const searchParams = new URLSearchParams(window.location.search);
    
    if (value === 'All Vehicles') {
      searchParams.delete('vehicle');
      // Fetch all requests when 'All Vehicles' is selected
      fetchAllRequests();
    } else if (value && value !== 'Select Vehicle') {
      searchParams.set('vehicle', value);
      // Fetch requests for specific vehicle
      fetchAllRequests(value);
    } else {
      // 'Select Vehicle' or empty selection
      searchParams.delete('vehicle');
      setRequests([]);
    }
    
    // Update URL without page reload
    const newUrl = searchParams.toString() ? `?${searchParams.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  const { user } = useAuth();
  const handleViewDetails = (requestId: string) => {
    let baseRoute;
    switch (user?.role) {
      case 'supervisor':
        baseRoute = '/supervisor';
        break;
      case 'technical-manager':
        baseRoute = '/technical-manager';
        break;
      case 'engineer':
        baseRoute = '/engineer';
        break;
      case 'customer-officer':
        baseRoute = '/customer-officer';
        break;
      default:
        baseRoute = '/user';
    }
    navigate(`${baseRoute}/request-details/${requestId}`, {
      state: { fromInquiry: true }
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending')) return 'bg-yellow-50 text-yellow-800 border-yellow-100';
    if (statusLower.includes('approved')) return 'bg-green-50 text-green-800 border-green-100';
    if (statusLower.includes('order placed') || statusLower.includes('place order')) return 'bg-purple-50 text-purple-800 border-purple-100';
    if (statusLower.includes('complete')) return 'bg-blue-50 text-blue-800 border-blue-100';
    if (statusLower.includes('rejected')) return 'bg-red-50 text-red-800 border-red-100';
    return 'bg-gray-50 text-gray-800 border-gray-100';
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Request #{request.id}
                </h3>
                {request.requestDate && (
                  <div className="text-sm text-gray-500 mt-1">
                    Submitted on {formatDate(request.requestDate)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(request.status)} border flex items-center shadow-sm`}>
                {getStatusIcon(request.status)}
                {request.status.toLowerCase() === 'complete' ? 'Complete - Engineer Approved' : request.status}
                {getStatusExtraText(request.status)}
              </span>
              {request.status.toLowerCase() === 'complete' && (
                <p className="text-sm text-gray-600 italic flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />
                  The order has been sent to the customer officer 
                </p>
              )}
            </div>
          </div>
          {/* ... (rest of the code remains the same) */}
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Order Number</p>
                              <p className="text-sm font-medium text-gray-900">
                                {!request.orderNumber || request.orderNumber === 'The order has not yet been placed with a supplier' 
                                  ? <span className="italic text-gray-500">The order has not yet been placed with a supplier</span>
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
                                {!request.supplierName || request.supplierName === 'The order has not yet been placed with a supplier'
                                  ? <span className="italic text-gray-500">The order has not yet been placed with a supplier</span>
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