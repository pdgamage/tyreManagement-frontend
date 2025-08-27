export interface Receipt {
  id: string;
  orderId: string;
  requestId: string;
  receiptNumber: string;
  dateGenerated: string;
  totalAmount: number;
  customerOfficerId: string;
  customerOfficerName: string;
  vehicleNumber: string;
  vehicleBrand: string;
  vehicleModel: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierAddress?: string;
  items: ReceiptItem[];
  notes?: string;
  submittedDate: string;
  orderPlacedDate: string;
}

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemDetails?: {
    tireSize?: string;
    brand?: string;
    model?: string;
  };
}
