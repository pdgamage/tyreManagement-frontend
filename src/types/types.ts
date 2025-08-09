export interface Request {
  id: string;
  requestDate: string;
  status: string;
  orderNumber?: string;
  supplierName?: string;
  tireCount?: number;
  vehicleNumber?: string;
}
