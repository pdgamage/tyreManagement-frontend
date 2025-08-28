import React from 'react';
import { X, Download, Printer, FileDown } from 'lucide-react';
import type { Request } from '../types/request';
import type { Order } from '../types/Order';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderReceipt from './OrderReceipt';
import { generateReceiptNumber } from '../utils/receiptUtils';

const requestToOrder = (request: Request): Order => ({
  id: Number(request.id),
  orderNumber: request.id,
  orderPlacedDate: request.order_timestamp?.toString() || new Date().toISOString(),
  submittedAt: request.submittedAt,
  requesterName: request.requesterName,
  userSection: request.userSection || '',
  costCenter: request.costCenter || '',
  requesterPhone: request.requesterPhone,
  vehicleNumber: request.vehicleNumber,
  vehicleBrand: request.vehicleBrand,
  vehicleModel: request.vehicleModel,
  tireSize: request.tireSize,
  quantity: request.quantity,
  tubesQuantity: request.tubesQuantity,
  warrantyDistance: request.warrantyDistance || 0,
  supplierName: request.supplierName || '',
  supplierPhone: request.supplierPhone || '',
  totalPrice: request.totalPrice || 0,
  // Additional fields
  deliveryOfficeName: request.deliveryOfficeName,
  deliveryStreetName: request.deliveryStreetName,
  deliveryTown: request.deliveryTown,
  requestReason: request.requestReason,
  existingTireMake: request.existingTireMake,
  order_placed_date: request.order_timestamp?.toString()
});

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl">
        {/* Print-only header */}
        <div className="hidden print:block text-center p-4">
          <h1 className="text-xl font-bold">SLT Mobitel</h1>
          <p className="text-gray-600 text-sm">Tire Management System</p>
        </div>

        {/* Header with action buttons */}
        <div className="flex items-center justify-between p-4 border-b print:hidden bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Official Order Receipt #{request.id}
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm"
              title="Print Receipt"
            >
              <Printer className="w-5 h-5 mr-2" />
              <span>Print</span>
            </button>
            <PDFDownloadLink
              document={<OrderReceipt order={requestToOrder(request)} />}
              fileName={`order-receipt-${request.id}.pdf`}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors shadow-sm"
            >
              {({ loading }) => (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  <span>
                    {loading ? 'Preparing...' : 'Download PDF'}
                  </span>
                </>
              )}
            </PDFDownloadLink>
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

          {/* Receipt Content */}
        <div className="p-6 space-y-6" id="printable-receipt">
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">SLT Mobitel</h1>
            <p className="text-lg text-gray-600">Tire Management System</p>
            <p className="text-lg font-semibold mt-2">Official Purchase Order</p>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-2 gap-6 border-b pb-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold">Order Information:</p>
                <p className="text-sm font-medium">Receipt No: <span className="text-blue-600">{generateReceiptNumber(request)}</span></p>
                <p className="text-sm">Request ID: <span className="text-gray-600">#{request.id}</span></p>
                <p className="text-sm">Order Submitted: <span className="text-gray-700">{request.submittedAt ? formatDate(request.submittedAt) : '-'}</span></p>
                <p className="text-sm">Order Placed: <span className="text-gray-700">{request.order_timestamp ? formatDate(request.order_timestamp) : '-'}</span></p>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold">Delivery Address:</p>
                <p className="text-sm">Office: <span className="text-gray-700">{request.deliveryOfficeName || '-'}</span></p>
                <p className="text-sm">Street: <span className="text-gray-700">{request.deliveryStreetName || '-'}</span></p>
                <p className="text-sm">Town: <span className="text-gray-700">{request.deliveryTown || '-'}</span></p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="mt-3">
                <p className="text-sm font-semibold">Request Details:</p>
                <p className="text-sm">Reason: <span className="text-gray-700">{request.requestReason || '-'}</span></p>
              </div>
            </div>
          </div>

          {/* Contact and Vehicle Information */}
          <div className="grid grid-cols-2 gap-6 text-sm border-b pb-4">
            <div className="space-y-2">
              <p className="font-semibold">Contact Information:</p>
              <p><span className="font-medium">Requester:</span> {request.requesterName}</p>
              <p><span className="font-medium">Phone:</span> {request.requesterPhone}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Vehicle Information:</p>
              <p><span className="font-medium">Number:</span> {request.vehicleNumber}</p>
              <p><span className="font-medium">Make/Model:</span> {request.vehicleBrand} {request.vehicleModel}</p>
            </div>
          </div>          {/* Order Details Table */}
          <div className="mt-4">
            <div className="bg-gray-50 rounded border text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Item Description</th>
                    <th className="text-center p-2">Make/Size</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-gray-50">
                    <td className="p-2 text-sm" colSpan={4}>
                      <span className="font-medium">Existing Tire:</span> {request.existingTireMake || 'N/A'}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">New Tires</td>
                    <td className="text-center">{request.tireSize}</td>
                    <td className="text-center">{request.quantity}</td>
                    <td className="text-right">{formatCurrency(request.totalPrice)}</td>
                  </tr>
                  {request.tubesQuantity > 0 && (
                    <tr className="border-b">
                      <td className="p-2">Tubes</td>
                      <td className="text-center">{request.tireSize}</td>
                      <td className="text-center">{request.tubesQuantity}</td>
                      <td className="text-right">Included</td>
                    </tr>
                  )}
                  <tr className="font-semibold bg-gray-100">
                    <td colSpan={3} className="p-2 text-right">Total:</td>
                    <td className="p-2 text-right">{formatCurrency(request.totalPrice)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            <div className="space-y-1">
              <p><span className="font-medium">Supplier:</span> {request.supplierName || '-'}</p>
              <p><span className="font-medium">Supplier Phone:</span> {request.supplierPhone || '-'}</p>
              <p><span className="font-medium">Supplier Email:</span> {request.supplierEmail || '-'}</p>
              <p><span className="font-medium">Warranty:</span> {request.warrantyDistance ? `${request.warrantyDistance.toLocaleString()} KM` : '-'}</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-medium">Order Number:</span> {request.id}</p>
              <p><span className="font-medium">Current KM:</span> {request.presentKmReading.toLocaleString()}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t">
            <div className="text-center">
              <div className="border-t border-gray-300 w-32 mx-auto mt-8"></div>
              <p className="text-xs text-gray-600 mt-1">Customer Officer</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-300 w-32 mx-auto mt-8"></div>
              <p className="text-xs text-gray-600 mt-1">Requester</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t">
            <p>This is an official receipt of SLT Mobitel Tire Management System</p>
            <p>Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
