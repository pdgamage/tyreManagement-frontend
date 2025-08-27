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
  supplierDetails: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  paymentMethod?: string;
  paymentStatus: string;
  notes?: string;
  companyDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
  };
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
