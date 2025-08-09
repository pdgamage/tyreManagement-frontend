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

  // Add watermark function with SLT background image
  const addWatermark = () => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = '/img/sltbg.png';
      
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
          // Add background image
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const imgWidth = pageWidth * 0.7; // Scale image to 70% of page width
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
      
      // If image fails to load, use text watermark as fallback
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

  // SLT Logo URL (commented out as we're using text for now)
  // const sltLogo = 'https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg';
  
  // Page width for centering calculations
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add SLT logo and title
  const addLogoAndTitle = () => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = '/img/slt_logo.png';
      
      img.onload = () => {
        // Add logo (height: 40px, width will maintain aspect ratio)
        const logoHeight = 40;
        const logoWidth = (img.width * logoHeight) / img.height;
        const logoX = 20; // 20mm from left
        const logoY = 15; // 15mm from top
        
        doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        
        // Add title next to the logo
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Tire Request Report', logoX + logoWidth + 20, logoY + (logoHeight / 2) + 5, { align: 'left', baseline: 'middle' });
        
        resolve();
      };
      
      // Fallback if logo fails to load
      img.onerror = () => {
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Tire Request Report', pageWidth / 2, 25, { align: 'center' });
        resolve();
      };
    });
  };
  
  // Add logo and title
  await addLogoAndTitle();
  
  // Add request info in a centered block
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  // Calculate text width for proper centering
  const requestIdText = `Request ID: ${request.id}`;
  const dateText = `Date: ${new Date().toLocaleDateString()}`;
  const textWidth = Math.max(
    doc.getTextWidth(requestIdText),
    doc.getTextWidth(dateText)
  );
  const startX = (pageWidth - textWidth) / 2;
  
  doc.text(requestIdText, startX, 40);
  doc.text(dateText, startX, 48);

  // Add centered section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Request Information', pageWidth / 2, 65, { align: 'center' });
  
  // Request details table
  const requestData = [
    ['Vehicle Number', request.vehicleNumber || '-'],
    ['Order Number', request.orderNumber || 'Not assigned'],
    ['Status', request.status],
    ['Request Date', new Date(request.requestDate || request.submittedAt).toLocaleString()],
    ['Order Placed Date', request.orderPlacedDate ? new Date(request.orderPlacedDate).toLocaleString() : 'Not placed yet'],
  ];

  // Calculate table width based on content
  const tableColumnWidths = [80, 100]; // Adjust these values as needed
  const tableWidth = tableColumnWidths[0] + tableColumnWidths[1];
  const tableStartX = (pageWidth - tableWidth) / 2;

  (doc as any).autoTable({
    startY: 75,
    head: [['Field', 'Value']],
    body: requestData,
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 91, 150], // SLT Blue
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
      cellWidth: 'wrap',
      halign: 'left',
      valign: 'middle'
    },
    columnStyles: {
      0: { 
        cellWidth: tableColumnWidths[0],
        fontStyle: 'bold',
        halign: 'left'
      },
      1: { 
        cellWidth: tableColumnWidths[1],
        halign: 'left'
      }
    },
    margin: { 
      left: tableStartX,
      right: 'auto'
    }
  });

  // Add tire details section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tire Details', pageWidth / 2, (doc as any).lastAutoTable.finalY + 20, { align: 'center' });
  
  // Tire details table
  const tireData = request.tireDetails.map((tire: any) => [
    tire.position || '-',
    tire.size || '-',
    tire.quantity || '-',
    tire.brand || '-',
    tire.pattern || '-',
    tire.condition || '-',
    tire.notes || '-',
  ]);

  // Calculate tire table width and position
  const tireTableColumnWidths = [25, 30, 15, 30, 30, 30, 40]; // Fixed widths for all columns
  const tireTableWidth = tireTableColumnWidths.reduce((sum, width) => sum + width, 0);
  const tireTableStartX = (pageWidth - tireTableWidth) / 2;

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 30,
    head: [['Position', 'Size', 'Qty', 'Brand', 'Pattern', 'Condition', 'Notes']],
    body: tireData,
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 91, 150],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      cellPadding: 3,
      fontSize: 8,
      cellWidth: 'wrap',
      overflow: 'linebreak',
      lineWidth: 0.1,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: Object.fromEntries(
      tireTableColumnWidths.map((width, index) => [
        index,
        { 
          cellWidth: width,
          halign: index === 6 ? 'left' : 'center', // Left align notes, center others
          valign: 'middle'
        }
      ])
    ),
    margin: { 
      left: tireTableStartX,
      right: 'auto'
    }
  });

  // Add supplier information if available
  if (request.supplierName) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Supplier Information', pageWidth / 2, (doc as any).lastAutoTable.finalY + 20, { align: 'center' });
    
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
