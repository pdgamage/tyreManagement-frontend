export interface Request {
  id: string;
  requestDate: string;
  status: string;
  orderNumber?: string;
  orderPlacedDate?: string;
  vehicleNumber: string;
  tireCount?: number;
  tubesQuantity?: number;
  tireSize?: string;
  supplierName?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  supplierContact?: string;
  approvedBy?: string;
  engineerName?: string;
  engineerContact?: string;
  engineerNotes?: string;
  brand?: string;
  pattern?: string;
  position?: string;
  size?: string;
  currentKmReading?: number;
  lastReplacementKm?: number;
  lastReplacementDate?: string;
  requestType?: string;
  quantity?: number;
  priority?: string;
  notes?: string;
  condition?: string;
  replacementReason?: string;
  recommendedPressure?: string;
  inspectionNotes?: string;
  approvalStatus?: string;
  approvalDate?: string;
  requestDetails?: string;
  comments?: string;
}

export interface RequestsPDFProps {
  requests: Request[];
}
