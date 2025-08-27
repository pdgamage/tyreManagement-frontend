import React from 'react';
import { Receipt } from '../types/Receipt';
import { FileDown, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptProps {
  receipt: Receipt;
  onClose?: () => void;
}

const ReceiptTemplate: React.FC<ReceiptProps> = ({ receipt, onClose }) => {
  const downloadAsPDF = async () => {
    const receiptElement = document.getElementById('receipt-template');
    if (!receiptElement) return;

    try {
      const canvas = await html2canvas(receiptElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${receipt.receiptNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header with action buttons - fixed at top */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10 p-4 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Receipt Preview</h1>
          <div className="flex space-x-3">
            <button
              onClick={downloadAsPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700"
            >
              <FileDown size={18} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-gray-700"
            >
              <Printer size={18} />
              <span>Print</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content - scrollable */}
      <div className="flex-1 overflow-auto mt-20 p-6">
        <div id="receipt-template" className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8 print:shadow-none">
          <div className="space-y-8">
            {/* Receipt Header with Logo and Title */}
            <div className="text-center border-b pb-6">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">SLT Tire Management System</h1>
                <p className="text-sm text-gray-500 mt-1">Official Purchase Receipt</p>
              </div>
            </div>

            {/* Receipt Details Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-6 border-b">
              <div>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-600 mb-2">Receipt Information</h2>
                  <p className="text-sm"><span className="font-medium">Receipt #:</span> {receipt.receiptNumber}</p>
                  <p className="text-sm"><span className="font-medium">Generated:</span> {new Date(receipt.dateGenerated).toLocaleString()}</p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-600 mb-2">Order Information</h2>
                  <p className="text-sm"><span className="font-medium">Request #:</span> {receipt.requestId}</p>
                  <p className="text-sm"><span className="font-medium">Order #:</span> {receipt.orderNumber}</p>
                  <p className="text-sm"><span className="font-medium">Submitted:</span> {receipt.submittedDate ? new Date(receipt.submittedDate).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Order Placed:</span> {receipt.orderPlacedDate ? new Date(receipt.orderPlacedDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-600 mb-2">Customer Officer Details</h2>
                  <p className="text-sm"><span className="font-medium">Name:</span> {receipt.customerOfficerName || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">ID:</span> {receipt.customerOfficerId || 'N/A'}</p>
                </div>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-600 mb-2">Vehicle Information</h2>
                  <p className="text-sm"><span className="font-medium">Vehicle No:</span> {receipt.vehicleNumber}</p>
                  <p className="text-sm"><span className="font-medium">Brand:</span> {receipt.vehicleBrand}</p>
                  <p className="text-sm"><span className="font-medium">Model:</span> {receipt.vehicleModel}</p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-600 mb-2">Supplier Information</h2>
                  <p className="text-sm"><span className="font-medium">Name:</span> {receipt.supplierName || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {receipt.supplierEmail || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Phone:</span> {receipt.supplierPhone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            {/* Items Table with horizontal scroll for small screens */}
            <div className="py-6 border-b overflow-x-auto">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">Order Items</h2>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price (LKR)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total (LKR)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receipt.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{item.description}</div>
                        {item.itemDetails && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.itemDetails.tireSize && <span className="mr-2">Size: {item.itemDetails.tireSize}</span>}
                            {item.itemDetails.brand && <span className="mr-2">Brand: {item.itemDetails.brand}</span>}
                            {item.itemDetails.model && <span>Model: {item.itemDetails.model}</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        {item.unitPrice.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        {item.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm">
                      Total Amount
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      LKR {receipt.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes Section */}
            {receipt.notes && (
              <div className="py-6 border-b">
                <h2 className="text-sm font-semibold text-gray-600 mb-2">Notes</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{receipt.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6">
              <div className="text-center">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-600">SLT Mobitel Tire Management</h2>
                  <p className="text-xs text-gray-500">123 Corporate Drive, Colombo</p>
                  <p className="text-xs text-gray-500">Phone: +94 11 234 5678</p>
                  <p className="text-xs text-gray-500">Email: tiremanagement@cpc.lk | Web: www.cpc.lk</p>
                </div>
                <p className="text-xs text-gray-400">
                  This is a computer generated receipt and does not require a signature.
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
