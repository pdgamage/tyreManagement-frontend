import React from 'react';
import { X, Printer, FileDown } from 'lucide-react';
import type { Request } from '../types/request';
import type { Order } from '../types/Order';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderReceiptPDF from './OrderReceipt';
import { generateReceiptNumber } from '../utils/receiptUtils';

interface ReceiptModalProps {
  request: Request | null;
  onClose: () => void;
  isOpen: boolean;
}

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
  deliveryOfficeName: request.deliveryOfficeName,
  deliveryStreetName: request.deliveryStreetName,
  deliveryTown: request.deliveryTown,
  requestReason: request.requestReason,
  existingTireMake: request.existingTireMake,
  orderPlacedAt: request.order_timestamp?.toString()
});

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
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl my-4">
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
                <PDFDownloadLink
                  document={<OrderReceiptPDF order={requestToOrder(request)} />}
                  fileName={`order-receipt-${request.id}.pdf`}
                >
                  {({ loading, error }) => (
                    <button 
                      disabled={loading}
                      className={`inline-flex items-center px-4 py-2 rounded-md transition-colors shadow-sm ${
                        loading || error 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <FileDown className="w-5 h-5 mr-2" />
                      <span>
                        {loading ? 'Preparing...' : error ? 'Error' : 'Download PDF'}
                      </span>
                    </button>
                  )}
                </PDFDownloadLink>
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

        {/* Rest of your component remains the same */}
        {/* Your existing receipt content JSX */}
        
      </div>
    </div>
  );
};

export default ReceiptModal;
