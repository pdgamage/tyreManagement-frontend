import React from 'react';
import { Receipt } from '../types/Receipt';
import { FileDown, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptProps {
  receipt: Receipt;
  onClose?: () => void;
}

interface ReceiptProps {
  receipt: Receipt;
  onClose?: () => void;
}

const ReceiptTemplate: React.FC<ReceiptProps> = ({ receipt, onClose }) => {
  const downloadAsPDF = async () => {
    const receiptElement = document.getElementById('receipt-template');
    if (!receiptElement) return;

    try {
      // Set background to white for PDF
      const originalBackground = receiptElement.style.background;
      receiptElement.style.background = 'white';

      const canvas = await html2canvas(receiptElement, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Restore original background
      receiptElement.style.background = originalBackground;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `receipt-${receipt.receiptNumber || 'unknown'}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed header with buttons */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Receipt View</h1>
          <div className="flex space-x-3">
            <button
              onClick={downloadAsPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FileDown size={20} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Printer size={20} />
              <span>Print</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="receipt-template" className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-10 print:shadow-none">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="mt-4">
                    <h2 className="text-2xl font-bold text-gray-900">SLT Mobitel Tire Management</h2>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-extrabold text-gray-900">RECEIPT</h1>
                    <p className="text-gray-600 mt-2">Receipt #: {receipt.receiptNumber || 'N/A'}</p>
                    <p className="text-gray-600">
                      Generated Date: {receipt.dateGenerated ? 
                        new Date(receipt.dateGenerated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                    </p>
                    <p className="text-gray-600">Request #: {receipt.requestId || receipt.orderId || 'N/A'}</p>
                    <p className="text-gray-600">Order #: {receipt.orderNumber || 'N/A'}</p>
                    <p className="text-gray-600">
                      Submitted Date: {receipt.submittedDate ? 
                        new Date(receipt.submittedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      Order Placed Date: {receipt.orderPlacedDate ? 
                        new Date(receipt.orderPlacedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                    </p>
                  </div>
                </div>            {/* Customer & Vehicle Info */}
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Details</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Vehicle Number:</span> {receipt.vehicleNumber || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Brand:</span> {receipt.vehicleBrand || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Model:</span> {receipt.vehicleModel || 'N/A'}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600">
                    <span className="font-medium">Customer Officer:</span> {receipt.customerOfficerName || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Officer ID:</span> {receipt.customerOfficerId || 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Supplier Details</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span> {receipt.supplierName || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {receipt.supplierEmail || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {receipt.supplierPhone || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Address:</span> {receipt.supplierAddress || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-10">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receipt.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{item.description}</div>
                        {item.itemDetails && (
                          <div className="text-xs text-gray-500">
                            {item.itemDetails.tireSize && `Size: ${item.itemDetails.tireSize}`}
                            {item.itemDetails.brand && ` • Brand: ${item.itemDetails.brand}`}
                            {item.itemDetails.model && ` • Model: ${item.itemDetails.model}`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan={2} />
                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 text-right">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 text-right">
                      ${receipt.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes */}
            {receipt.notes && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Notes</h3>
                <p className="mt-4 text-gray-600">{receipt.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-500 text-sm">
                Thank you for your business!
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptTemplate;
