import React from 'react';
import { X, Download, Printer, FileDown } from 'lucide-react';
import type { Request } from '../types/request';
import type { Order } from '../types/Order';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderReceipt from './OrderReceipt';

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
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = document.getElementById('printable-receipt')?.innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Order Receipt - ${request.id}</title>
            <style>
              @page { size: A4; margin: 2cm; }
              body { font-family: Arial, sans-serif; }
              .receipt-container { padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 1em 0; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              th { background-color: #f3f4f6; }
              .header { text-align: center; margin-bottom: 2em; }
              .footer { text-align: center; margin-top: 2em; font-size: 0.8em; }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              ${content}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl">
        {/* Print-only header */}
        <div className="hidden print:block text-center p-4">
          <h1 className="text-xl font-bold">Sri Lanka Transport Board</h1>
          <p className="text-gray-600 text-sm">Tire Management System</p>
        </div>

        {/* Header with action buttons */}
        <div className="flex items-center justify-between p-4 border-b print:hidden bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Official Order Receipt #{request.id}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              <span className="text-sm">Print</span>
            </button>
            <PDFDownloadLink
              document={<OrderReceipt order={requestToOrder(request)} />}
              fileName={`order-receipt-${request.id}.pdf`}
              className="flex items-center px-3 py-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
            >
              {({ loading }) => (
                <>
                  <Download className="w-4 h-4 mr-1.5" />
                  <span className="text-sm">
                    {loading ? 'Preparing...' : 'Download PDF'}
                  </span>
                </>
              )}
            </PDFDownloadLink>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

          {/* Receipt Content */}
        <div className="p-6 space-y-6" id="printable-receipt">
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sri Lanka Transport Board</h1>
            <p className="text-lg text-gray-600">Tire Management System</p>
            <p className="text-lg font-semibold mt-2">Official Purchase Order</p>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-2 gap-6 border-b pb-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold">Order Details:</p>
                <p className="text-sm">Order Number: <span className="text-gray-700">{request.id}</span></p>
                <p className="text-sm">Submitted Date: <span className="text-gray-700">{formatDate(request.submittedAt)}</span></p>
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
              <div>
                <p className="text-sm font-semibold">Department Information:</p>
                <p className="text-sm">Department: <span className="text-gray-700">{request.userSection || '-'}</span></p>
                <p className="text-sm">Cost Center: <span className="text-gray-700">{request.costCenter || '-'}</span></p>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold">Request Details:</p>
                <p className="text-sm">Reason: <span className="text-gray-700">{request.requestReason || '-'}</span></p>
                <p className="text-sm">Existing Tire Make: <span className="text-gray-700">{request.existingTireMake || '-'}</span></p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p><span className="font-medium">Requester:</span> {request.requesterName}</p>
              <p><span className="font-medium">Contact:</span> {request.requesterPhone}</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-medium">Vehicle Number:</span> {request.vehicleNumber}</p>
              <p><span className="font-medium">Make/Model:</span> {request.vehicleBrand} {request.vehicleModel}</p>
            </div>
          </div>

          {/* Order Details Table */}
          <div className="mt-4">
            <div className="bg-gray-50 rounded border text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Item</th>
                    <th className="text-center p-2">Size</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Tires</td>
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
              <p><span className="font-medium">Warranty:</span> {request.warrantyDistance ? `${request.warrantyDistance.toLocaleString()} KM` : '-'}</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-medium">Order Reference:</span> {request.id}</p>
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
            <p>This is an official receipt of SLTB Tire Management System</p>
            <p>Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
