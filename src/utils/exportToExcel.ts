import * as XLSX from 'xlsx';

export interface TireDetails {
  id: string;
  type: string;
  size: string;
  brand: string;
  position: string;
  quantity: number;
  damage: string;
  mileage: number;
  requestId: string;
}

export interface RequestData {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  requestDate: string;
  created_at?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  orderPlacedAt?: string;
  completedAt?: string;
  supplierName?: string;
  tireCount?: number;
  requestedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  remarks?: string;
  rejectReason?: string;
  costCentre?: string;
  department?: string;
  tireDetails?: TireDetails[];
  totalCost?: number;
  paymentStatus?: string;
  deliveryStatus?: string;
  engineerRemarks?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

export const exportToExcel = (data: RequestData[], fileName: string = 'tire_requests') => {
  // Transform data for Excel with all available details
  const excelData = data.map(request => ({
    'Request ID': request.id,
    'Vehicle Number': request.vehicleNumber,
    'Status': request.status,
    'Order Number': request.orderNumber || 'Not assigned',
    'Supplier': request.supplierName || 'Not assigned',
    'Department': request.department || 'Not assigned',
    'Cost Centre': request.costCentre || 'Not assigned',
    'Total Cost': request.totalCost || 0,
    'Payment Status': request.paymentStatus || 'Not updated',
    'Delivery Status': request.deliveryStatus || 'Not updated',
    'Expected Delivery': request.expectedDeliveryDate ? new Date(request.expectedDeliveryDate).toLocaleString() : 'Not set',
    'Actual Delivery': request.actualDeliveryDate ? new Date(request.actualDeliveryDate).toLocaleString() : 'Not delivered',
    'Tire Count': request.tireCount || 0,
    'Requested By': request.requestedBy || 'Not available',
    'Approved By': request.approvedBy || 'Not approved',
    'Rejected By': request.rejectedBy || 'Not rejected',
    'Remarks': request.remarks || 'No remarks',
    'Reject Reason': request.rejectReason || 'N/A',
    'Engineer Remarks': request.engineerRemarks || 'No remarks',
    'Request Date': request.requestDate ? new Date(request.requestDate).toLocaleString() : 'N/A',
    'Created At': request.created_at ? new Date(request.created_at).toLocaleString() : 'N/A',
    'Submitted At': request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A',
    'Approved At': request.approvedAt ? new Date(request.approvedAt).toLocaleString() : 'N/A',
    'Rejected At': request.rejectedAt ? new Date(request.rejectedAt).toLocaleString() : 'N/A',
    'Order Placed At': request.orderPlacedAt ? new Date(request.orderPlacedAt).toLocaleString() : 'N/A',
    'Completed At': request.completedAt ? new Date(request.completedAt).toLocaleString() : 'N/A',
    // Include tire details if available
    ...request.tireDetails?.reduce((acc, tire, index) => ({
      ...acc,
      [`Tire ${index + 1} Type`]: tire.type,
      [`Tire ${index + 1} Size`]: tire.size,
      [`Tire ${index + 1} Brand`]: tire.brand,
      [`Tire ${index + 1} Position`]: tire.position,
      [`Tire ${index + 1} Quantity`]: tire.quantity,
      [`Tire ${index + 1} Damage`]: tire.damage,
      [`Tire ${index + 1} Mileage`]: tire.mileage
    }), {}) || {}
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Auto-size columns
  const colWidths: number[] = [];
  excelData.forEach((row: Record<string, any>) => {
    Object.keys(row).forEach((key, i) => {
      const cellValue = String(row[key] || '');
      colWidths[i] = Math.max(colWidths[i] || 0, cellValue.length, key.length);
    });
  });

  ws['!cols'] = colWidths.map(width => ({ width: Math.min(width + 2, 50) }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tire Requests');

  // Generate Excel file with current timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
};
