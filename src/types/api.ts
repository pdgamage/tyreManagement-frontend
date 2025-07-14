export interface Vehicle {
  id: number;
  vehicleNumber: string;
  make?: string;
  model?: string;
  year?: number;
  tireSize?: string;
  department?: string;
  status?: string;
}

export interface TireRequest {
  id: number;
  vehicleId: number;
  vehicleNumber: string;
  vehicleType?: string;
  quantity: number;
  tubesQuantity: number;
  tireSize: string;
  requestReason: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  year: string;
  vehicleBrand: string;
  vehicleModel: string;
  userSection: string;
  lastReplacementDate: string;
  existingTireMake: string;
  tireSizeRequired: string;
  costCenter: string;
  presentKmReading: number;
  previousKmReading: number;
  tireWearPattern: string;  comments?: string;
  images?: (File | string | null)[];
  status?: string;
  submittedAt?: string;
  supervisorApproved?: boolean;
  supervisorNotes?: string;
  supervisorTimestamp?: string;
  technicalManagerApproved?: boolean;
  technicalManagerNotes?: string;
  technicalManagerTimestamp?: string;
  engineerApproved?: boolean;
  engineerNotes?: string;
  engineerTimestamp?: string;
  orderPlaced?: boolean;
  orderTimestamp?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}