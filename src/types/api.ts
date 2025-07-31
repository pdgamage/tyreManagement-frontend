export interface Vehicle {
  id: number;
  vehicleNo: string;
  make: string;
  model: string;
  department: string;
  type?: string;
  costCentre?: string;
  chassisNo?: string;
  engineNo?: string;
  registeredDate?: string;
  tyreSize?: string;
  initialOdometer?: number;
  status?: string;
}

export interface TireDetails {
  id: number;
  tire_size: string;
  tire_brand: string;
  total_price: number;
  warranty_distance: number;
}

export interface TireRequest {
  id: number;
  vehicleId: number;
  vehicleNumber: string;
  vehicleType?: string;
  vehicleDepartment?: string;
  vehicleCostCentre?: string;
  quantity: number;
  tubesQuantity: number;
  tireSize: string;
  requestReason: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  vehicleBrand: string;
  vehicleModel: string;
  lastReplacementDate: string;
  existingTireMake: string;
  tireSizeRequired: string;
  presentKmReading: number;
  previousKmReading: number;
  tireWearPattern: string;
  comments?: string;
  images?: (File | string | null)[];
  status?: string;
  submittedAt?: string;
  supervisorApproved?: boolean;
  supervisorNotes?: string;
  supervisorTimestamp?: string;
  technicalManagerApproved?: boolean;
  technicalManagerNotes?: string;
  // New delivery and pricing fields
  deliveryOfficeName?: string;
  deliveryStreetName?: string;
  deliveryTown?: string;
  totalPrice?: number;
  warrantyDistance?: number;
  tireWearIndicatorAppeared?: boolean;
  technicalManagerTimestamp?: string;
  engineerApproved?: boolean;
  engineerNotes?: string;
  engineerTimestamp?: string;
  orderPlaced?: boolean;
  orderTimestamp?: string;
  customer_officer_note?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
