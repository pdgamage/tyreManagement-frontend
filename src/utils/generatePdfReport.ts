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

  // Add watermark function with background image
  const addWatermark = () => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      // Use the background image from the images folder
      img.src = '/src/images/sltbg.png';
      
      img.onload = () => {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          // Create GState with type assertion for opacity
          const GState = (doc as any).GState;
          if (GState) {
            const gstate = new GState({ opacity: 0.1 });
            doc.setGState(gstate);
          }
          // Add background image (scaled to 70% of page width, centered)
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const imgWidth = pageWidth * 0.7;
          const imgHeight = (img.height * imgWidth) / img.width;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
          
          doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
          
          // Reset GState
          if (GState) {
            doc.setGState(new GState({ opacity: 1 }));
          }
        }
        resolve();
      };
      
      // Fallback to text watermark if image fails to load
      img.onerror = () => {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(80);
          doc.setTextColor(230, 230, 230);
          const GState = (doc as any).GState;
          if (GState) {
            const gstate = new GState({ opacity: 0.1 });
            doc.setGState(gstate);
          }
          doc.text('SLT TMS', 105, 150, { align: 'center', angle: 45 });
          if (GState) {
            doc.setGState(new GState({ opacity: 1 }));
          }
        }
        resolve();
      };
    });
  };

  // Add SLT logo and title
  const addLogoAndTitle = () => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      // Use the logo from the images folder
      img.src = '/src/images/slt_logo.png';
      
      img.onload = () => {
        // Add logo (height: 15mm, width will maintain aspect ratio)
        const logoHeight = 15;
        const logoWidth = (img.width * logoHeight) / img.height;
        const logoX = 14; // 14mm from left
        const logoY = 10; // 10mm from top
        
        doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        
        // Add title next to the logo
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Tire Request Report', logoX + logoWidth + 10, logoY + (logoHeight / 2), { 
          align: 'left',
          baseline: 'middle'
        });
        
        // Add request ID and date below the logo
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Request ID: ${request.id}`, logoX, logoY + logoHeight + 10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, logoX, logoY + logoHeight + 16);
        
        resolve();
      };
      
      // Fallback if logo fails to load
      img.onerror = () => {
        // Original layout without logo
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Tire Request Report', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Request ID: ${request.id}`, 14, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
        
        resolve();
      };
    });
  };
  
  // Add logo and title
  await addLogoAndTitle();

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
  await addWatermark();

    // Return the PDF data URL for preview
    const dataUrl = doc.output('datauristring');
    return dataUrl;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again later.');
  }
};
