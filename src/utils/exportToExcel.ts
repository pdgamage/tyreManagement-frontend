import * as XLSX from 'xlsx';

export interface RequestData {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  requestDate: string;
  created_at?: string;
  submittedAt?: string;
  supplierName?: string;
  tireCount?: number;
}

export const exportToExcel = (data: RequestData[], fileName: string = 'tire_requests') => {
  // Transform data for Excel
  const excelData = data.map(request => ({
    'Request ID': request.id,
    'Vehicle Number': request.vehicleNumber,
    'Status': request.status,
    'Order Number': request.orderNumber || 'Not assigned',
    'Supplier': request.supplierName || 'Not assigned',
    'Tire Count': request.tireCount || 0,
    'Request Date': new Date(request.requestDate).toLocaleString(),
    'Submitted At': request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A'
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tire Requests');

  // Generate Excel file
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
