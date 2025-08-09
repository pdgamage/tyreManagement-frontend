// @ts-ignore - jspdf types are not properly exported
import { jsPDF } from 'jspdf';
// @ts-ignore - jspdf-autotable doesn't have proper types
import 'jspdf-autotable';

// Define the RequestDetails interface since we can't import it
interface RequestDetails {
  id: string;
  requestNo: string;
  date: string;
  status: string;
  priority: string;
  requestedBy: string;
  department: string;
  location: string;
  vehicleNo: string;
  vehicleType: string;
  driverName: string;
  driverContact: string;
  notes?: string;
  tires: TireDetail[];
  supplier?: Supplier;
}

interface TireDetail {
  id: string;
  position: string;
  size: string;
  pattern: string;
  brand: string;
  quantity: number;
  status: string;
  notes?: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

// Import images - these will be handled by webpack
import logoImage from '../images/slt_logo.png';
import bgImage from '../images/sltbg.png';

interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
}

interface TableData {
  [key: string]: any;
}

// Helper function to load image as base64
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      throw error;
    };
    img.src = url;
  });
};

// Add logo and title to the PDF
const addLogoAndTitle = async (doc: any, title: string): Promise<void> => {
  try {
    const logoDataUrl = await loadImageAsBase64(logoImage);
    
    // Add logo (15mm height, width auto)
    doc.addImage(logoDataUrl, 'PNG', 15, 15, 0, 15);
    
    // Add title next to logo
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 30, 25);
    
    // Add line under header
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);
  } catch (error) {
    console.error('Error adding logo:', error);
    // Fallback to text-only header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, 25);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);
  }
};

// Add watermark to all pages
const addWatermark = async (doc: any): Promise<void> => {
  try {
    const watermarkDataUrl = await loadImageAsBase64(bgImage);
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add watermark image (scaled to 70% of page width, centered)
      const imgWidth = pageWidth * 0.7;
      const imgHeight = (imgWidth * 0.5); // Adjust aspect ratio as needed
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      
      // Set opacity for watermark
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.addImage(watermarkDataUrl, 'PNG', x, y, imgWidth, imgHeight);
      doc.setGState(new doc.GState({ opacity: 1 }));
    }
  } catch (error) {
    console.error('Error adding watermark:', error);
    // Fallback to text watermark
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(72);
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      
      // Rotated text watermark
      doc.saveGraphicsState();
      doc.rotate(45, pageWidth / 2, pageHeight / 2);
      doc.text('SRI LANKA TELECOM', pageWidth / 2, pageHeight / 2, { align: 'center' });
      doc.restoreGraphicsState();
      
      doc.setGState(new doc.GState({ opacity: 1 }));
      doc.setTextColor(0, 0, 0);
    }
  }
};

// Add a table to the PDF
const addTable = (
  doc: any,
  startY: number,
  title: string,
  columns: TableColumn[],
  data: TableData[],
  columnStyles: any = {}
): number => {
  // Add table title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, startY);
  
  // Prepare data for autotable
  const tableData = data.map(row => 
    columns.map(col => row[col.dataKey] ?? '')
  );
  
  const tableHeaders = columns.map(col => col.header);
  
  // Add table using jspdf-autotable
  (doc as any).autoTable({
    startY: startY + 5,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: 'linebreak',
      lineWidth: 0.1,
      lineColor: [200, 200, 200]
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      ...columnStyles
    },
    margin: { left: 14, right: 14 }
  });
  
  return (doc as any).lastAutoTable.finalY + 10;
};

// Format date to display
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Main function to generate PDF report
export const generatePdfReport = async (request: RequestDetails): Promise<string> => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add logo and title
    await addLogoAndTitle(doc, 'Tire Request Report');

    // Add request information table
    const requestInfoY = 50;
    const requestInfoColumns: TableColumn[] = [
      { header: 'Field', dataKey: 'field' },
      { header: 'Value', dataKey: 'value' },
    ];

    const requestInfoData = [
      { field: 'Request No', value: request.requestNo },
      { field: 'Date', value: formatDate(request.date) },
      { field: 'Status', value: request.status },
      { field: 'Priority', value: request.priority },
      { field: 'Requested By', value: request.requestedBy },
      { field: 'Department', value: request.department },
      { field: 'Location', value: request.location },
      { field: 'Vehicle No', value: request.vehicleNo },
      { field: 'Vehicle Type', value: request.vehicleType },
      { field: 'Driver Name', value: request.driverName },
      { field: 'Driver Contact', value: request.driverContact },
    ];

    // Add request information table
    let currentY = await addTable(
      doc,
      requestInfoY,
      'Request Information',
      requestInfoColumns,
      requestInfoData,
      { 0: { cellWidth: 60 }, 1: { cellWidth: 'auto' } }
    );

    // Add tire details table if available
    if (request.tires && request.tires.length > 0) {
      const tireColumns: TableColumn[] = [
        { header: 'Position', dataKey: 'position' },
        { header: 'Size', dataKey: 'size' },
        { header: 'Pattern', dataKey: 'pattern' },
        { header: 'Brand', dataKey: 'brand' },
        { header: 'Qty', dataKey: 'quantity' },
        { header: 'Status', dataKey: 'status' },
      ];

      currentY = await addTable(
        doc,
        currentY + 10,
        'Tire Details',
        tireColumns,
        request.tires,
        {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 15 },
          5: { cellWidth: 25 },
        }
      );
    }

    // Add supplier information if available
    if (request.supplier) {
      const supplierColumns: TableColumn[] = [
        { header: 'Field', dataKey: 'field' },
        { header: 'Value', dataKey: 'value' },
      ];

      const supplierData = [
        { field: 'Supplier', value: request.supplier.name },
        { field: 'Contact Person', value: request.supplier.contactPerson },
        { field: 'Phone', value: request.supplier.phone },
        { field: 'Email', value: request.supplier.email },
        { field: 'Address', value: request.supplier.address },
      ];

      await addTable(
        doc,
        currentY + 10,
        'Supplier Information',
        supplierColumns,
        supplierData,
        { 0: { cellWidth: 50 }, 1: { cellWidth: 'auto' } }
      );
    }

    // Add watermark to all pages
    await addWatermark(doc);

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Return the PDF as a data URL
    return doc.output('datauristring');
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Failed to generate PDF report');
  }
};

const addLogoAndTitle = async (doc: any, request: RequestDetails): Promise<void> => {
  try {
    const logoDataUrl = await loadImageAsBase64(logoImage);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const logoHeight = 15;
        const logoWidth = (img.width * logoHeight) / img.height;
        const logoX = 14;
        const logoY = 10;
        
        doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Tire Request Report', logoX + logoWidth + 10, logoY + (logoHeight / 2), { 
          align: 'left',
          baseline: 'middle' as any
        });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Request ID: ${request.id}`, logoX, logoY + logoHeight + 10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, logoX, logoY + logoHeight + 16);
        
        resolve();
      };
      img.src = logoDataUrl;
    });
  } catch (error) {
    console.error('Error adding logo:', error);
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Tire Request Report', 105, 20, { align: 'center' } as any);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Request ID: ${request.id}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    return Promise.resolve();
  }
};

const addWatermark = async (doc: any): Promise<void> => {
  try {
    const bgDataUrl = await loadImageAsBase64(bgImage);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const GState = (doc as any).GState;
          if (GState) {
            const gstate = new GState({ opacity: 0.1 });
            doc.setGState(gstate);
          }
          
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const imgWidth = pageWidth * 0.7;
          const imgHeight = (img.height * imgWidth) / img.width;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
          
          doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
          
          if (GState) {
            doc.setGState(new GState({ opacity: 1 }));
          }
        }
        resolve();
      };
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
          doc.text('SLT TMS', 105, 150, { align: 'center', angle: 45 } as any);
          if (GState) {
            doc.setGState(new GState({ opacity: 1 }));
          }
        }
        resolve();
      };
      img.src = bgDataUrl;
    });
  } catch (error) {
    console.error('Error adding watermark:', error);
    return Promise.resolve();
  }
};

export const generatePdfReport = async (request: RequestDetails): Promise<string> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  try {
    await addLogoAndTitle(doc, request);
    
    let currentY = 60;
    
    // Request Information
    currentY = addTable(
      doc,
      currentY,
      'Request Information',
      [
        { header: 'Field', dataKey: 'field' },
        { header: 'Value', dataKey: 'value' }
      ],
      [
        { field: 'Request ID', value: request.id },
        { field: 'Request Date', value: new Date().toLocaleDateString() },
        { field: 'Status', value: request.status || 'N/A' },
        { field: 'Priority', value: request.priority || 'N/A' },
        { field: 'Notes', value: request.notes || 'N/A' }
      ],
      { 0: { cellWidth: 40 }, 1: { cellWidth: 'auto' } }
    );
    
    // Add tire details if available
    if (request.tireDetails?.length) {
      currentY = addTable(
        doc,
        currentY,
        'Tire Details',
        [
          { header: 'Tire ID', dataKey: 'id' },
          { header: 'Size', dataKey: 'size' },
          { header: 'Brand', dataKey: 'brand' },
          { header: 'Quantity', dataKey: 'quantity' },
          { header: 'Price', dataKey: 'price' }
        ],
        request.tireDetails,
        { 
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 }
        }
      );
    }
    
    // Add supplier information if available
    if (request.supplier) {
      currentY = addTable(
        doc,
        currentY,
        'Supplier Information',
        [
          { header: 'Field', dataKey: 'field' },
          { header: 'Value', dataKey: 'value' }
        ],
        [
          { field: 'Name', value: request.supplier.name || 'N/A' },
          { field: 'Contact', value: request.supplier.contactPerson || 'N/A' },
          { field: 'Email', value: request.supplier.email || 'N/A' },
          { field: 'Phone', value: request.supplier.phone || 'N/A' },
          { field: 'Address', value: request.supplier.address || 'N/A' }
        ],
        { 0: { cellWidth: 40 }, 1: { cellWidth: 'auto' } }
      );
    }
    
    await addWatermark(doc);
    
    return doc.output('datauristring');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add logo and title
  const addLogoAndTitle = async (): Promise<void> => {
    try {
      const logoDataUrl = await loadImageAsBase64(logoImage);
      return new Promise((resolve) => {
        const img = new Image();
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
            baseline: 'middle' as any
          });
          
          // Add request ID and date below the logo
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Request ID: ${request.id}`, logoX, logoY + logoHeight + 10);
          doc.text(`Date: ${new Date().toLocaleDateString()}`, logoX, logoY + logoHeight + 16);
          
          resolve();
        };
        img.src = logoDataUrl;
      });
    } catch (error) {
      console.error('Error adding logo:', error);
      // Fallback to text if logo fails to load
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Tire Request Report', 105, 20, { align: 'center' } as any);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Request ID: ${request.id}`, 14, 30);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
      return Promise.resolve();
    }
  };

  // Add watermark function with background image
  const addWatermark = async (): Promise<void> => {
    try {
      const bgDataUrl = await loadImageAsBase64(bgImage);
      return new Promise((resolve) => {
        const img = new Image();
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
        img.onerror = () => {
          // Fallback to text watermark if image fails to load
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
            doc.text('SLT TMS', 105, 150, { align: 'center', angle: 45 } as any);
            if (GState) {
              doc.setGState(new GState({ opacity: 1 }));
            }
          }
          resolve();
        };
        img.src = bgDataUrl;
      });
    } catch (error) {
      console.error('Error adding watermark:', error);
      // Fallback to text watermark if image fails to load
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
        doc.text('SLT TMS', 105, 150, { align: 'center', angle: 45 } as any);
        if (GState) {
          doc.setGState(new GState({ opacity: 1 }));
        }
      }
      return Promise.resolve();
    }
  };

  try {
    // Add logo and title
    await addLogoAndTitle();
    
    // Add request information table
    let currentY = 60;
    
    // Request Information
    currentY = addTable(
      doc,
      currentY,
      'Request Information',
      [
        { header: 'Field', dataKey: 'field' },
        { header: 'Value', dataKey: 'value' }
      ],
      [
        { field: 'Request ID', value: request.id },
        { field: 'Request Date', value: new Date().toLocaleDateString() },
        { field: 'Status', value: request.status },
        { field: 'Priority', value: request.priority },
        { field: 'Notes', value: request.notes || 'N/A' }
      ],
      { 0: { cellWidth: 40 }, 1: { cellWidth: 'auto' } }
    );
    
    // Add tire details if available
    if (request.tireDetails && request.tireDetails.length > 0) {
      currentY = addTable(
        doc,
        currentY,
        'Tire Details',
        [
          { header: 'Tire ID', dataKey: 'id' },
          { header: 'Size', dataKey: 'size' },
          { header: 'Brand', dataKey: 'brand' },
          { header: 'Quantity', dataKey: 'quantity' },
          { header: 'Price', dataKey: 'price' }
        ],
        request.tireDetails,
        { 
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 }
        }
      );
    }
    
    // Add supplier information if available
    if (request.supplier) {
      currentY = addTable(
        doc,
        currentY,
        'Supplier Information',
        [
          { header: 'Field', dataKey: 'field' },
          { header: 'Value', dataKey: 'value' }
        ],
        [
          { field: 'Name', value: request.supplier.name },
          { field: 'Contact', value: request.supplier.contactPerson },
          { field: 'Email', value: request.supplier.email },
          { field: 'Phone', value: request.supplier.phone },
          { field: 'Address', value: request.supplier.address }
        ],
        { 0: { cellWidth: 40 }, 1: { cellWidth: 'auto' } }
      );
    }
    
    // Add watermark to all pages
    await addWatermark();
    
    // Return the PDF as a data URL
    return doc.output('datauristring');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
    return new Promise(async (resolve, reject) => {
      try {
        // Convert image to data URL
        const response = await fetch(sltBg);
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result as string;
          
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
          img.onerror = () => {
            // Fallback to text watermark if image fails to load
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
        };
        reader.onerror = () => {
          reject(new Error('Failed to read watermark image'));
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error loading watermark:', error);
        // Fallback to text watermark
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
      }
    });
  };

  // Add SLT logo and title
  const addLogoAndTitle = (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Convert logo to data URL
        const response = await fetch(sltLogo);
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result as string;
          
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
        
          };
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading logo:', error);
      // Fallback to text if logo fails to load
      return new Promise<void>((resolve) => {
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
