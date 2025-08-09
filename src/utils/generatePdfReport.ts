// @ts-ignore - jspdf types are not properly exported
import { jsPDF } from 'jspdf';
// @ts-ignore - jspdf-autotable doesn't have proper types
import 'jspdf-autotable';
import { RequestDetails } from '../types';

// Extend the window object to include jsPDF types
declare global {
  interface Window {
    jsPDF: any;
  }
}

export const generatePdfReport = async (request: RequestDetails): Promise<string> => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add watermark function
  const addWatermark = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(80);
      doc.setTextColor(230, 230, 230);
      // Create GState with type assertion
      const GState = (doc as any).GState;
      if (GState) {
        const gstate = new GState({ opacity: 0.1 });
        doc.setGState(gstate);
      }
      doc.text('SLT TMS', 105, 150, { align: 'center', angle: 45 });
      // Reset GState
      if (GState) {
        doc.setGState(new GState({ opacity: 1 }));
      }
    }
  };

  // SLT Logo as data URL (converted from SVG)
  const sltLogo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMTQwIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMjAuOCA0MS4yaDE2Ljd2NTcuN2gtMTYuN3YtNTcuN3ptMjkuNyAwaDE2Ljd2NTcuN2gtMTYuN3YtNTcuN3ptLTU5LjQgMGgxNi43djU3LjdINzF2LTU3Ljd6bTI5LjcgMGgxNi43djU3LjdIMTAwLjd2LTU3Ljd6bTg5LjEgMGg0MS44YzguOSAwIDE1LjkgNy4xIDE1LjkgMTUuOHYyNi4yYzAgOC43LTcgMTUuOC0xNS45IDE1LjhoLTQxLjh2LTU3Ljh6bTE2LjcgNDEuM2gxOC4zdi0xMC4yaC0xOC4zYy0xLjYgMC0yLjkgMS4yLTIuOSAyLjd2NC44YzAgMS41IDEuMyAyLjcgMi45IDIuN3ptNDkuMS0yNS43YzAtMTEuMSA5LTUuOCA5LTEzLjNoLTE2Ljd2MjcuMWgxNi43YzAtNy41LTktMi4yLTktMTMuOHptMTYuNyAwaDBoLS4xem0tMTYuNy0yNS43aDE2LjdjMC03LjUtOS0yLjItOSAxMy44djBoMTYuN2MwLTExLjEgOS01LjggOSAxMy4zaC0xNi43djI3LjFoMTYuN2MwLTExLjEtOS01LjgtOSAxMy44aC0xNi43di01NC44em0zMy40IDBoMTYuN3Y1NC44aC0xNi43di01NC44em0zMy40IDBoMTYuN3Y1NC44aC0xNi43di01NC44em0zMy40IDBoMTYuN3Y1NC44aC0xNi43di01NC44em0zMy40IDBoMTYuN3Y1NC44aC0xNi43di01NC44em0tMTY2LjggMGMxMS4xIDAgMTkuOSA4LjkgMTkuOSAxOS45djE2LjhjMCAxMS4xLTguOSAxOS45LTE5LjkgMTkuOXYtMzkuN3ptMCA1NC44YzExLjEgMCAxOS45IDguOSAxOS45IDE5Ljl2MTYuOGMwIDExLjEtOC45IDE5LjktMTkuOSAxOS45di0zOS44em0tMTYuNy0zOWgxNi43djM5LjdoLTE2Ljd2LTM5Ljd6bTAgNTQuOGgxNi43djM5LjdoLTE2Ljd2LTM5Ljd6IiBmaWxsPSIjMDA1Qjk2Ii8+PC9zdmc+';
  
  // Add header with logo and title
  try {
    // Add SLT logo to the header
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS if needed
    img.src = sltLogo;
    
    await new Promise((resolve, reject) => { 
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // Add logo (width: 40mm, height will maintain aspect ratio)
    doc.addImage(img, 'PNG', 14, 10, 80, 25); // Adjusted size for better visibility
    
    // Adjust title position to be next to the logo
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Tire Request Report', 105, 30, { align: 'center' });
  } catch (error) {
    console.error('Error loading logo:', error);
    // Fallback to text if logo fails to load
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Tire Request Report', 105, 20, { align: 'center' });
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Request ID: ${request.id}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);

  // Add request details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Request Information', 14, 50);
  
  // Request details table
  const requestData = [
    ['Vehicle Number', request.vehicleNumber || '-'],
    ['Order Number', request.orderNumber || 'Not assigned'],
    ['Status', request.status],
    ['Request Date', new Date(request.requestDate || request.submittedAt).toLocaleString()],
    ['Order Placed Date', request.orderPlacedDate ? new Date(request.orderPlacedDate).toLocaleString() : 'Not placed yet'],
  ];

  (doc as any).autoTable({
    startY: 60,
    head: [['Field', 'Value']],
    body: requestData,
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 91, 150], // SLT Blue
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
      cellWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  // Add tire details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tire Details', 14, (doc as any).lastAutoTable.finalY + 15);
  
  const tireData = [
    ['Tire Quantity', request.quantity || '-'],
    ['Tubes Quantity', request.tubesQuantity || '-'],
    ['Tire Size', request.tireSize || 'Not specified']
  ];

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Detail', 'Value']],
    body: tireData,
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 91, 150],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 5,
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  // Add supplier information if available
  if (request.supplierName) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Supplier Information', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const supplierData = [
      ['Supplier Name', request.supplierName],
      ['Phone', request.supplierPhone || '-'],
      ['Email', request.supplierEmail || '-']
    ];

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Field', 'Value']],
      body: supplierData,
      theme: 'grid',
      headStyles: { 
        fillColor: [0, 91, 150],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 5,
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Add watermark to all pages
  addWatermark();

    // Return the PDF data URL for preview
    const dataUrl = doc.output('datauristring');
    return dataUrl;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again later.');
  }
};
