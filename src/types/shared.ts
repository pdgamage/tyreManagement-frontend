export interface BaseRequest {
  id: string | number;
  vehicleNumber: string;
  quantity: number;
  tubesQuantity: number;
  tireSize: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  vehicleBrand: string;
  vehicleModel: string;
  userSection?: string;
  costCenter?: string;
  totalPrice?: number;
  warrantyDistance?: number;
  lastReplacementDate: string | Date;
  presentKmReading: number;
  orderNumber?: string;
  orderPlacedDate?: string;
  supplierName?: string;
  supplierPhone?: string;
  supplierEmail?: string;
}
