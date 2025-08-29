import React from 'react';
import { X, Printer, FileDown } from 'lucide-react';
import type { Request } from '../types/request';
import { format } from 'date-fns';
// We'll print the actual DOM to a new window so the downloaded PDF matches the on-screen receipt
import { generateReceiptNumber } from '../utils/receiptUtils';

// ...existing code...

interface ReceiptModalProps {
  request: Request | null;
  onClose: () => void;
  isOpen: boolean;
}

const formatDate = (date: string | Date | undefined) => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy');
};

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return 'LKR 0.00';
  return `LKR ${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const ReceiptModal: React.FC<ReceiptModalProps> = ({ request, onClose, isOpen }) => {
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    // Add print-specific styles to the head
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #printable-receipt, #printable-receipt * {
          visibility: visible;
        }
        #printable-receipt {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        @page {
          size: A4;
          margin: 2cm;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Print the document
    window.print();

    // Remove the style element after printing
    document.head.removeChild(style);
  };

  const handleDownload = () => {
    const printable = document.getElementById('printable-receipt');
    if (!printable) return;

    // Collect stylesheet and style tags to preserve styling in new window
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((n) => n.outerHTML)
      .join('\n');

    const newWin = window.open('', '_blank', 'noopener,noreferrer');
    if (!newWin) return;

    newWin.document.open();
    newWin.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Receipt</title>${styles}<style>body{background:#fff;padding:20px}</style></head><body>${printable.outerHTML}</body></html>`);
    newWin.document.close();

    // Wait for styles to load then print
    setTimeout(() => {
      newWin.focus();
      newWin.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl my-4">
        {/* Fixed Action Buttons Bar */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm print:hidden">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Official Order Receipt #{request.id}
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm"
                title="Print Receipt"
              >
                <Printer className="w-5 h-5 mr-2" />
                <span>Print</span>
              </button>
              <div>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors shadow-sm"
                  title="Download PDF"
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  <span>Download PDF</span>
                </button>
              </div>
              <button
                onClick={onClose}
                className="flex items-center px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-md transition-colors shadow-sm"
                title="Close"
              >
                <X size={20} className="mr-2" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block text-center p-4">
          <h1 className="text-xl font-bold">Sri Lanka Telecom Mobitel</h1>
          <p className="text-gray-600 text-sm">Tire Management System</p>
        </div>

          {/* Receipt Content */}
        <div className="p-6 space-y-6 bg-white" id="printable-receipt">
          {/* Company Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="flex-1">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg" 
                alt="SLT Mobitel Logo" 
                className="h-16"
              />
              <div className="mt-2 text-gray-600 text-sm">
                <p>SLT Mobitel Head Office</p>
                <p>Lotus Road, Colombo 01</p>
                <p>Sri Lanka</p>
                <p>Tel: +94 11 2399399</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
                <h2 className="text-xl font-bold text-blue-800">ORDER RECEIPT</h2>
                <p className="text-blue-600 font-medium mt-1">Receipt No: {generateReceiptNumber(request)}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Date Issued: {request.orderPlacedDate ? formatDate(request.orderPlacedDate) : '-'}</p>
                <p>Order Reference: #{request.orderNumber || '-'}</p>
                <p>Request ID: #{request.id}</p>
              </div>
            </div>
          </div>

          {/* Order Information & Delivery Details */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Order Information</h3>
              <div className="text-sm space-y-2">
                <p><span className="text-gray-600">Submission Date:</span> {request.submittedAt ? formatDate(request.submittedAt) : '-'}</p>
                <p><span className="text-gray-600">Order Placed Date:</span> {request.orderPlacedDate ? formatDate(request.orderPlacedDate) : '-'}</p>
                
              </div>
            </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Delivery Information</h3>
                <div className="text-sm space-y-2">
                  <p><span className="text-gray-600">Office:</span> {request.deliveryOfficeName || '-'}</p>
                  <p><span className="text-gray-600">Street:</span> {request.deliveryStreetName || '-'}</p>
                  <p><span className="text-gray-600">Town:</span> {request.deliveryTown || '-'}</p>
                </div>
              </div>
            </div>

          {/* Requester and Vehicle Information */}
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Requester Details</h3>
              <div className="text-sm space-y-2">
                <p><span className="text-gray-600">Name:</span> {request.requesterName}</p>
                <p><span className="text-gray-600">Contact:</span> {request.requesterPhone}</p>
               
                <p><span className="text-gray-600">Reason:</span> {request.requestReason || '-'}</p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Vehicle Details</h3>
              <div className="text-sm space-y-2">
                <p><span className="text-gray-600">Vehicle Number:</span> {request.vehicleNumber}</p>
                <p><span className="text-gray-600">Make/Model:</span> {request.vehicleBrand} {request.vehicleModel}</p>
                <p><span className="text-gray-600">Current KM:</span> {request.presentKmReading?.toLocaleString() || '-'}</p>
              </div>
            </div>
          </div>

          {/* Order Details Table */}
          {/* Order Details Table */}
          <div className="mt-6">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Item Description</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Make/Size</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-gray-50">
                    <td className="p-4" colSpan={4}>
                      <span className="font-medium text-gray-700">Current Tire Details:</span>
                      <span className="ml-2 text-gray-600">{request.existingTireMake || 'N/A'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">
                      <div className="font-medium text-gray-700">New Tires</div>
                      {request.warrantyDistance && (
                        <div className="text-sm text-gray-500 mt-1">
                          Warranty: {request.warrantyDistance.toLocaleString()} KM
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center text-gray-600">{request.tireSize}</td>
                    <td className="p-4 text-center text-gray-600">{request.quantity}</td>
                    <td className="p-4 text-right text-gray-800">{formatCurrency(request.totalPrice)}</td>
                  </tr>
                  {request.tubesQuantity > 0 && (
                    <tr>
                      <td className="p-4 text-gray-700">Tubes</td>
                      <td className="p-4 text-center text-gray-600">{request.tireSize}</td>
                      <td className="p-4 text-center text-gray-600">{request.tubesQuantity}</td>
                      <td className="p-4 text-right text-gray-600">Included</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="font-semibold">
                    <td colSpan={3} className="p-4 text-right text-gray-700">Total Amount:</td>
                    <td className="p-4 text-right text-gray-900">{formatCurrency(request.totalPrice)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">Supplier Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><span className="text-gray-600">Name:</span> <span className="text-gray-800">{request.supplierName || '-'}</span></p>
                <p><span className="text-gray-600">Phone:</span> <span className="text-gray-800">{request.supplierPhone || '-'}</span></p>
              </div>
              <div className="space-y-2">
                <p><span className="text-gray-600">Email:</span> <span className="text-gray-800">{request.supplierEmail || '-'}</span></p>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="border-t-2 border-gray-400 w-40 mx-auto mt-8"></div>
                <p className="text-sm font-medium text-gray-700 mt-2">Authorized By</p>
                <p className="text-xs text-gray-500">Customer Officer</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 w-40 mx-auto mt-8"></div>
                <p className="text-sm font-medium text-gray-700 mt-2">Requested By</p>
                <p className="text-xs text-gray-500">{request.requesterName}</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 w-40 mx-auto mt-8"></div>
                <p className="text-sm font-medium text-gray-700 mt-2">Approved By</p>
                <p className="text-xs text-gray-500">Department Head</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600">
                <p className="font-medium">SLT Mobitel - Tire Management System</p>
                <p className="mt-1">This is a computer-generated document</p>
                <p className="text-xs text-gray-500 mt-2">Generated on: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
