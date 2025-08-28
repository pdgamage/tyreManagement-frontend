import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import type { BaseRequest } from '../types/shared';
import { format } from 'date-fns';

interface ReceiptModalProps {
  request: BaseRequest | null;
  onClose: () => void;
  isOpen: boolean;
}

const formatDate = (date: string | undefined) => {
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
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
        {/* Print-only header */}
        <div className="hidden print:block text-center p-8">
          <h1 className="text-2xl font-bold">Sri Lanka Transport Board</h1>
          <p className="text-gray-600">Tire Management System</p>
        </div>

        {/* Header with action buttons */}
        <div className="flex items-center justify-between p-6 border-b print:hidden">
          <h3 className="text-2xl font-semibold text-gray-900">
            Official Order Receipt
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              title="Print Receipt"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              title="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 space-y-8" id="printable-receipt">
          {/* Receipt Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SLTB</h1>
              <p className="text-gray-600 mt-1">Tire Management System</p>
              <p className="text-gray-600">Order Management Division</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">Receipt #{request.orderNumber}</p>
              <p className="text-gray-600">Date: {formatDate(request.orderPlacedDate)}</p>
              <p className="text-gray-600">Request ID: {request.id}</p>
            </div>
          </div>

          {/* Customer & Vehicle Information */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Requester Information</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Name:</span> {request.requesterName}</p>
                <p><span className="text-gray-600">Department:</span> {request.userSection || '-'}</p>
                <p><span className="text-gray-600">Cost Center:</span> {request.costCenter || '-'}</p>
                <p><span className="text-gray-600">Contact:</span> {request.requesterPhone}</p>
                <p><span className="text-gray-600">Email:</span> {request.requesterEmail}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Vehicle Information</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Vehicle Number:</span> {request.vehicleNumber}</p>
                <p><span className="text-gray-600">Brand:</span> {request.vehicleBrand}</p>
                <p><span className="text-gray-600">Model:</span> {request.vehicleModel}</p>
                <p><span className="text-gray-600">Current KM:</span> {request.presentKmReading.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Specifications</th>
                    <th className="text-center py-2">Quantity</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3">Tires</td>
                    <td className="text-center">{request.tireSize}</td>
                    <td className="text-center">{request.quantity}</td>
                    <td className="text-right">{formatCurrency(request.totalPrice)}</td>
                  </tr>
                  {request.tubesQuantity > 0 && (
                    <tr>
                      <td className="py-3">Tubes</td>
                      <td className="text-center">{request.tireSize}</td>
                      <td className="text-center">{request.tubesQuantity}</td>
                      <td className="text-right">Included</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={3} className="py-3 text-right font-semibold">Total Amount:</td>
                    <td className="text-right font-bold">{formatCurrency(request.totalPrice)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Supplier & Warranty Information */}
          <div className="grid grid-cols-2 gap-8 border-t pt-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Supplier Details</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Name:</span> {request.supplierName || '-'}</p>
                <p><span className="text-gray-600">Contact:</span> {request.supplierPhone || '-'}</p>
                <p><span className="text-gray-600">Email:</span> {request.supplierEmail || '-'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Warranty Information</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Warranty Distance:</span> {request.warrantyDistance ? `${request.warrantyDistance.toLocaleString()} KM` : '-'}</p>
                <p><span className="text-gray-600">Last Replacement:</span> {formatDate(request.lastReplacementDate.toString())}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-6 mt-8">
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <div className="border-t border-gray-300 w-48 mx-auto mt-16"></div>
                <p className="text-sm text-gray-600 mt-2">Customer Officer Signature</p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-300 w-48 mx-auto mt-16"></div>
                <p className="text-sm text-gray-600 mt-2">Requester Signature</p>
              </div>
            </div>
            <p className="text-center text-gray-500 text-sm mt-8">
              This is an official receipt of the Sri Lanka Transport Board Tire Management System.
              <br />
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
