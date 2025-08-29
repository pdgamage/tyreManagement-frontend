export interface Order {
  id: number;
  orderNumber?: string;
  orderPlacedDate?: string | Date;
  submittedAt?: string | Date;
  requesterName: string;
  userSection?: string;
  costCenter?: string;
  requesterPhone: string;
  vehicleNumber: string;
  vehicleBrand: string;
  vehicleModel: string;
  tireSize: string;
  quantity: number;
  tubesQuantity: number;
  warrantyDistance?: number;
  supplierName?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  unitPrice?: number;
  totalPrice?: number;
  presentKmReading?: number;
  deliveryOfficeName?: string;
  deliveryStreetName?: string;
  deliveryTown?: string;
  requestReason?: string;
  existingTireMake?: string;
}
