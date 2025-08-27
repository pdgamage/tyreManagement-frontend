import * as XLSX from 'xlsx';

interface TireRequest {
  id: string;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  requestDate: string;
  created_at?: string;
  submittedAt?: string;
  supplierName?: string;
  tireCount?: number;
  cost_centre?: string;
  department?: string;
  brand?: string;
  size?: string;
  pattern?: string;
  serialNumber?: string;
  manufactureDate?: string;
  comments?: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  engineerApproval?: string;
  engineerComments?: string;
  engineerApprovalDate?: string;
}

export const exportToExcel = (requests: TireRequest[], filename: string = 'tire_requests') => {
  // Transform requests into a format suitable for Excel
  const data = requests.map(request => ({
    'Request ID': request.id,
    'Order Number': request.orderNumber || 'N/A',
    'Vehicle Number': request.vehicleNumber,
    'Status': request.status,
    'Request Date': new Date(request.requestDate).toLocaleString(),
    'Submitted Date': request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A',
    'Supplier Name': request.supplierName || 'Not assigned',
    'Number of Tires': request.tireCount || 0,
    'Cost Centre': request.cost_centre || 'N/A',
    'Department': request.department || 'N/A',
    'Tire Brand': request.brand || 'N/A',
    'Tire Size': request.size || 'N/A',
    'Tire Pattern': request.pattern || 'N/A',
    'Serial Number': request.serialNumber || 'N/A',
    'Manufacture Date': request.manufactureDate ? new Date(request.manufactureDate).toLocaleDateString() : 'N/A',
    'Comments': request.comments || 'No comments',
    'Approved By': request.approvedBy || 'N/A',
    'Approval Date': request.approvalDate ? new Date(request.approvalDate).toLocaleString() : 'N/A',
    'Rejection Reason': request.rejectionReason || 'N/A',
    'Engineer Approval': request.engineerApproval || 'N/A',
    'Engineer Comments': request.engineerComments || 'N/A',
    'Engineer Approval Date': request.engineerApprovalDate ? new Date(request.engineerApprovalDate).toLocaleString() : 'N/A',
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
