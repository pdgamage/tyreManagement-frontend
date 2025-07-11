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
  year: string;
  vehicleBrand: string;
  vehicleModel: string;
  userSection: string;
  lastReplacementDate: Date | string;
  existingTireMake: string;
  tireSizeRequired: string;
  costCenter: string;
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
    | "rejected";
  submittedAt: Date | string;
  images?: string[];
  supervisor_notes?: string;
  technical_manager_note?: string;
  engineer_note?: string;
  supervisorId: string;
  technical_manager_id?: string;
  supervisor_decision_by?: string;
  engineer_decision_by?: string;
}
