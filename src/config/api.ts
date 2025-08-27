// Centralized API configuration
export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://tyremanagement-backend-production-b135.up.railway.app",
  ENDPOINTS: {
    // User endpoints
    USERS: "/api/users",
    SUPERVISORS: "/api/users/supervisors",

    // Vehicle endpoints
    VEHICLES: "/api/vehicles",

    // Request endpoints
    REQUESTS: "/api/requests",

    // Tire details endpoints
    TIRE_DETAILS: "/api/tire-details",
    TIRE_SIZES: "/api/tire-details/sizes",
    TIRE_DETAILS_BY_SIZE: "/api/tire-details/size",

    // Supplier endpoints
    SUPPLIERS: "/api/suppliers",

    // Receipt endpoints
    RECEIPTS: "/api/receipts",
    GENERATE_RECEIPT: "/api/requests/:requestId/generate-receipt",
    GET_RECEIPT_BY_ORDER: "/api/requests/:orderId/receipt",

    // Health check
    HEALTH: "/api/health",
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  if (params) {
    return `${baseUrl}${endpoint}/${params}`;
  }
  return `${baseUrl}${endpoint}`;
};

// Specific API URL builders
export const apiUrls = {
  // User URLs
  supervisors: () => buildApiUrl(API_CONFIG.ENDPOINTS.SUPERVISORS),

  // Vehicle URLs
  vehicles: () => buildApiUrl(API_CONFIG.ENDPOINTS.VEHICLES),

  // Request URLs
  requests: () => buildApiUrl(API_CONFIG.ENDPOINTS.REQUESTS),
  requestById: (id: string | number) =>
    buildApiUrl(API_CONFIG.ENDPOINTS.REQUESTS, id.toString()),
  requestsByUser: (userId: string | number) =>
    buildApiUrl(`${API_CONFIG.ENDPOINTS.REQUESTS}/user`, userId.toString()),

  // Tire details URLs
  tireDetails: () => buildApiUrl(API_CONFIG.ENDPOINTS.TIRE_DETAILS),
  tireSizes: () => buildApiUrl(API_CONFIG.ENDPOINTS.TIRE_SIZES),
  tireDetailsBySize: (size: string) =>
    buildApiUrl(
      API_CONFIG.ENDPOINTS.TIRE_DETAILS_BY_SIZE,
      encodeURIComponent(size)
    ),

  // Supplier URLs
  suppliers: () => buildApiUrl(API_CONFIG.ENDPOINTS.SUPPLIERS),

  // Receipt URLs
  receipts: () => buildApiUrl(API_CONFIG.ENDPOINTS.RECEIPTS),
  generateReceipt: (requestId: string | number) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.GENERATE_RECEIPT.replace(':requestId', requestId.toString())),
  getReceiptByOrder: (orderId: string | number) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.GET_RECEIPT_BY_ORDER.replace(':orderId', orderId.toString())),

  // Health check
  health: () => buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH),
};
