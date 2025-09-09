import * as XLSX from 'xlsx';
import { Request } from '../types/request';

export const exportToExcel = (requests: Request[], filename: string = 'tire_requests') => {
  // Transform requests into a format suitable for Excel
  const data = requests.map(request => ({
    'Request ID': request.id,
    'Order Number': request.orderNumber || 'N/A',
    'Vehicle Number': request.vehicleNumber,
    'Status': request.status === 'pending' ? 'User Requested tire' : request.status,
    'Request Date': new Date(request.lastReplacementDate).toLocaleString(),
    'Submitted Date': request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A',
    'Supplier Name': request.supplierName || 'Not assigned',
    'Number of Tires': request.quantity || 0,
    'Cost Centre': request.costCenter || 'N/A',
    'Department': request.userSection || 'N/A',
    'Tire Brand': request.existingTireMake || 'N/A',
    'Tire Size': request.tireSize || 'N/A',
    'Tire Pattern': request.tireWearPattern || 'N/A',
    'Serial Number': request.id || 'N/A',
    'Manufacture Date': request.lastReplacementDate ? new Date(request.lastReplacementDate).toLocaleDateString() : 'N/A',
    'Comments': request.comments || 'No comments',
    'Approved By': request.supervisor_decision_by || 'N/A',
    'Approval Date': request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A',
    'Rejection Reason': request.supervisor_notes || 'N/A',
    'Engineer Approval': request.engineer_decision_by || 'N/A',
    'Engineer Comments': request.engineer_note || 'N/A',
    'Engineer Approval Date': request.engineer_decision_by ? new Date().toLocaleString() : 'N/A',
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Style the worksheet
  ws['!cols'] = [
    { wch: 15 }, // Request ID
    { wch: 15 }, // Order Number
    { wch: 15 }, // Vehicle Number
    { wch: 20 }, // Status
    { wch: 20 }, // Request Date
    { wch: 20 }, // Submitted Date
    { wch: 20 }, // Supplier Name
    { wch: 15 }, // Number of Tires
    { wch: 15 }, // Cost Centre
    { wch: 15 }, // Department
    { wch: 15 }, // Tire Brand
    { wch: 15 }, // Tire Size
    { wch: 15 }, // Tire Pattern
    { wch: 15 }, // Serial Number
    { wch: 20 }, // Manufacture Date
    { wch: 30 }, // Comments
    { wch: 20 }, // Approved By
    { wch: 20 }, // Approval Date
    { wch: 30 }, // Rejection Reason
    { wch: 20 }, // Engineer Approval
    { wch: 30 }, // Engineer Comments
    { wch: 20 }, // Engineer Approval Date
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tire Requests');

  // Save to file
  const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
};