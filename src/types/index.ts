export interface RequestDetails {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  submittedAt: string;
  requestDate: string;
  orderPlacedDate?: string;
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  engineerName?: string;
  approvalDate?: string;
  remarks?: string;
  quantity?: number;
  tubesQuantity?: number;
  tireSize?: string;
}
