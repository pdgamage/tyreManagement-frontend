import * as XLSX from 'xlsx';

// Define types for Excel cell styles
interface ExcelCellStyle {
  font?: {
    bold?: boolean;
    color?: { rgb: string };
  };
  fill?: {
    fgColor: { rgb: string };
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'center' | 'bottom';
  };
  border?: {
    top?: { style: string; color: { rgb: string } };
    bottom?: { style: string; color: { rgb: string } };
    left?: { style: string; color: { rgb: string } };
    right?: { style: string; color: { rgb: string } };
  };
  numFmt?: string;
}

export interface RequestData {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleNumber: string;
  quantity: number;
  tubesQuantity: number;
  tireSize: string;
  requestReason: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  vehicleBrand: string;
  vehicleModel: string;
  lastReplacementDate: string;
  existingTireMake: string;
  tireSizeRequired: string;
  presentKmReading: number;
  previousKmReading: number;
  tireWearPattern: string;
  comments: string;
  status: string;
  submittedAt: string;
  supervisor_notes: string;
  technical_manager_note: string;
  engineer_note: string;
  customer_officer_note: string;
  supervisorId: string;
  technical_manager_id: string;
  supervisor_decision_by: string;
  engineer_decision_by: string;
  customer_officer_decision_by: string;
  deliveryOfficeName: string;
  deliveryStreetName: string;
  deliveryTown: string;
  totalPrice: number;
  warrantyDistance: number;
  tireWearIndicatorAppeared: boolean;
  Department: string;
  CostCenter: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  orderNumber: string;
  orderNotes: string;
  orderPlacedDate: string;
}

export const exportToExcel = (data: RequestData[], fileName: string = 'tire_requests') => {
  // Transform data for Excel with the exact database columns
  const excelData = data.map(request => ({
    'Request ID': request.id,
    'User ID': request.userId,
    'Vehicle ID': request.vehicleId,
    'Vehicle Number': request.vehicleNumber,
    'Quantity': request.quantity,
    'Tubes Quantity': request.tubesQuantity,
    'Tire Size': request.tireSize,
    'Request Reason': request.requestReason,
    'Requester Name': request.requesterName,
    'Requester Email': request.requesterEmail,
    'Requester Phone': request.requesterPhone,
    'Vehicle Brand': request.vehicleBrand,
    'Vehicle Model': request.vehicleModel,
    'Last Replacement Date': request.lastReplacementDate ? new Date(request.lastReplacementDate).toLocaleString() : 'N/A',
    'Existing Tire Make': request.existingTireMake,
    'Tire Size Required': request.tireSizeRequired,
    'Present KM Reading': request.presentKmReading,
    'Previous KM Reading': request.previousKmReading,
    'Tire Wear Pattern': request.tireWearPattern,
    'Comments': request.comments,
    'Status': request.status === 'pending' ? 'User Requested tire' : request.status,
    'Submitted At': request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A',
    'Supervisor Notes': request.supervisor_notes,
    'Technical Manager Note': request.technical_manager_note,
    'Engineer Note': request.engineer_note,
    'Customer Officer Note': request.customer_officer_note,
    'Delivery Office Name': request.deliveryOfficeName,
    'Delivery Street Name': request.deliveryStreetName,
    'Delivery Town': request.deliveryTown,
    'Total Price': request.totalPrice ? `$${request.totalPrice.toFixed(2)}` : '$0.00',
    'Warranty Distance': request.warrantyDistance ? `${request.warrantyDistance} km` : 'N/A',
    'Tire Wear Indicator Appeared': request.tireWearIndicatorAppeared ? 'Yes' : 'No',
    'Department': request.Department,
    'Cost Center': request.CostCenter,
    'Supplier Name': request.supplierName,
    'Supplier Email': request.supplierEmail,
    'Supplier Phone': request.supplierPhone,
    'Order Number': request.orderNumber,
    'Order Notes': request.orderNotes,
    'Order Placed Date': request.orderPlacedDate ? new Date(request.orderPlacedDate).toLocaleString() : 'N/A'
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData, { cellStyles: true });

  // Define styles with proper TypeScript types
  const headerStyle: ExcelCellStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '4472C4' } }, // Blue header
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  const dataStyle: ExcelCellStyle = {
    alignment: { vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'D9D9D9' } },
      bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
      left: { style: 'thin', color: { rgb: 'D9D9D9' } },
      right: { style: 'thin', color: { rgb: 'D9D9D9' } }
    }
  };

  // Get the range of the worksheet
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  
  // Apply styles to headers (first row)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) ws[cellAddress] = {};
    ws[cellAddress].s = headerStyle;
  }
  
  // Apply styles to data rows
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      
      // Apply alternating row colors
      const rowStyle = { ...dataStyle };
      if (R % 2 === 0) {
        rowStyle.fill = { fgColor: { rgb: 'F2F2F2' } }; // Light gray for even rows
      } else {
        rowStyle.fill = { fgColor: { rgb: 'FFFFFF' } }; // White for odd rows
      }
      
      ws[cellAddress].s = rowStyle;
    }
  }

  // Auto-size columns
  const colWidths: { wch: number }[] = [];
  excelData.forEach((row: Record<string, any>) => {
    Object.keys(row).forEach((key, i) => {
      const cellValue = String(row[key] || '');
      colWidths[i] = { wch: Math.max(
        colWidths[i]?.wch || 0, 
        cellValue.length, 
        key.length,
        // Set minimum column width
        10
      )};
    });
  });

  ws['!cols'] = colWidths.map(col => ({
    ...col,
    width: Math.min(col.wch + 2, 50) // Add some padding but cap at 50
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tire Requests');

  // Generate Excel file with current timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  // Add some metadata
  if (!wb.Props) {
    wb.Props = {};
  }
  wb.Props.Title = 'Tire Management - User Inquiries';
  wb.Props.Author = 'Tire Management System';
  wb.Props.CreatedDate = new Date();
  
  // Write the file
  XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
};
