export interface Request {
  id: string;
  userId?: string;
  vehicleId?: string;
  vehicleNumber: string;
  quantity: number;
  tubesQuantity: number;
  tireSize: string;
  requestReason: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  vehicleBrand: string;
  vehicleModel: string;
  lastReplacementDate: Date | string;
  existingTireMake: string;
  tireSizeRequired: string;
  presentKmReading: number;
  previousKmReading: number;
  tireWearPattern: string;
  comments: string | null;
  status:
    | "pending"
    | "supervisor approved"
    | "technical-manager approved"
    | "engineer approved"
    | "complete"
    | "order placed"
    | "order cancelled"
    | "rejected"
    | "supervisor rejected"
    | "technical-manager rejected"
    | "engineer rejected"
    | "customer-officer rejected";
  submittedAt: Date | string;
  images?: string[];
  supervisor_notes?: string;
  // Department and Cost Center fields
  userSection?: string;
  costCenter?: string;
  // New delivery and pricing fields
  deliveryOfficeName?: string;
  deliveryStreetName?: string;
  deliveryTown?: string;
  totalPrice?: number;
  warrantyDistance?: number;
  tireWearIndicatorAppeared?: boolean;
  technical_manager_note?: string;
  engineer_note?: string;
  customer_officer_note?: string;
  supervisorId: string;
  technical_manager_id?: string;
  supervisor_decision_by?: string;
  engineer_decision_by?: string;
  customer_officer_decision_by?: string;
  order_placed?: boolean;
  order_timestamp?: Date | string;
}
