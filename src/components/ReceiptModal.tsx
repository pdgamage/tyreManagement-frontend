import React from 'react';
import { X, Download, Printer, FileDown } from 'lucide-react';
import type { BaseRequest } from '../types/shared';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';

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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl">
        {/* Print-only header */}
        <div className="hidden print:block text-center p-4">
          <h1 className="text-xl font-bold">Sri Lanka Transport Board</h1>
          <p className="text-gray-600 text-sm">Tire Management System</p>
        </div>

        {/* Header with action buttons */}
        <div className="flex items-center justify-between p-4 border-b print:hidden bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Official Order Receipt #{request.orderNumber}
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
            <button
              onClick={() => {
                // Trigger PDF download
                const element = document.getElementById('printable-receipt');
                if (element) {
                  window.print();
                }
              }}
              className="flex items-center px-3 py-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
              title="Download Receipt"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span className="text-sm">Download</span>
            </button>
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
        <div className="p-4 space-y-4" id="printable-receipt">
          {/* Receipt Header */}
          <div className="flex justify-between items-start border-b pb-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">SLTB</h1>
              <p className="text-sm text-gray-600">Tire Management System</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Date: {formatDate(request.orderPlacedDate)}</p>
              <p className="text-sm text-gray-600">Ref: {request.id}</p>
            </div>
          </div>

          {/* Essential Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p><span className="font-medium">Requester:</span> {request.requesterName}</p>
              <p><span className="font-medium">Department:</span> {request.userSection || '-'}</p>
              <p><span className="font-medium">Cost Center:</span> {request.costCenter || '-'}</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-medium">Vehicle:</span> {request.vehicleNumber}</p>
              <p><span className="font-medium">Make/Model:</span> {request.vehicleBrand} {request.vehicleModel}</p>
              <p><span className="font-medium">Contact:</span> {request.requesterPhone}</p>
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
              <p><span className="font-medium">Order Number:</span> {request.orderNumber}</p>
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
