export interface Order {
  id: number;
  orderNumber: string;
  orderPlacedDate: string;
  submittedAt: string | Date;
  requesterName: string;
  userSection: string;
  costCenter: string;
  requesterPhone: string;
  vehicleNumber: string;
  vehicleBrand: string;
  vehicleModel: string;
  tireSize: string;
  quantity: number;
  tubesQuantity: number;
  warrantyDistance: number;
  supplierName: string;
  supplierPhone: string;
  totalPrice: number;
  // Additional fields
  deliveryOfficeName?: string;
  deliveryStreetName?: string;
  deliveryTown?: string;
  requestReason?: string;
  existingTireMake?: string;
  order_placed_date?: string;
  requesterEmail?: string;
  supplierEmail?: string;
  presentKmReading: number;
  orderPlaced?: boolean;
  receiptNumber: string;
}
