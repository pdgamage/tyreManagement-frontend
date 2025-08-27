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
      const originalBackground = receiptElement.style.background;
      receiptElement.style.background = 'white';

      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Fixed header with buttons */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-900">Receipt View</h1>
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
          <div id="receipt-template" className="relative bg-white shadow-2xl sm:rounded-3xl sm:p-10 print:shadow-none">
            <div className="max-w-3xl mx-auto">
              {/* Header */}
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-3xl"></div>
                <div className="relative pt-8 px-8 flex justify-between items-start">
                  <div className="text-white">
                    <h2 className="text-3xl font-bold">SLT Mobitel</h2>
                    <p className="text-blue-100">Tire Management System</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-extrabold text-blue-900 mb-2">RECEIPT</h1>
                    <p className="text-blue-800 font-medium">#{receipt.receiptNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="mt-16 grid grid-cols-2 gap-8 p-6 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm">Generated Date</p>
                  <p className="font-medium text-gray-900">{formatDate(receipt.dateGenerated)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Request #</p>
                  <p className="font-medium text-gray-900">{receipt.requestId || receipt.orderId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Order #</p>
                  <p className="font-medium text-gray-900">{receipt.orderNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Order Date</p>
                  <p className="font-medium text-gray-900">{formatDate(receipt.orderPlacedDate)}</p>
                </div>
              </div>

              {/* Customer & Vehicle Info */}
              <div className="mt-8 grid grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Vehicle Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-sm">Vehicle Number</p>
                      <p className="font-medium text-gray-900">{receipt.vehicleNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Brand & Model</p>
                      <p className="font-medium text-gray-900">
                        {receipt.vehicleBrand || 'N/A'} {receipt.vehicleModel || ''}
                      </p>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-gray-600 text-sm">Customer Officer</p>
                      <p className="font-medium text-gray-900">{receipt.customerOfficerName || 'N/A'}</p>
                      <p className="text-sm text-gray-600">ID: {receipt.customerOfficerId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Supplier Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-sm">Name</p>
                      <p className="font-medium text-gray-900">{receipt.supplierName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Contact</p>
                      <p className="font-medium text-gray-900">{receipt.supplierPhone || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{receipt.supplierEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Address</p>
                      <p className="font-medium text-gray-900">{receipt.supplierAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {receipt.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.description}</div>
                            {item.itemDetails && (
                              <div className="text-sm text-gray-500 mt-1">
                                {item.itemDetails.tireSize && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Size: {item.itemDetails.tireSize}</span>}
                                {item.itemDetails.brand && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Brand: {item.itemDetails.brand}</span>}
                                {item.itemDetails.model && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Model: {item.itemDetails.model}</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={2}></td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">Total Amount</td>
                        <td className="px-6 py-4 text-lg font-bold text-blue-600 text-right">
                          {formatCurrency(receipt.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {receipt.notes && (
                <div className="mt-8 bg-yellow-50 border border-yellow-100 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Notes</h3>
                  <p className="text-yellow-800">{receipt.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-900">Thank You for Your Business!</h3>
                  <p className="mt-2 text-gray-600">
                    For any queries, please contact our support team
                  </p>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>SLT Mobitel Tire Management</p>
                  <p>123 Corporate Drive, Colombo • +94 11 234 5678</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the component
export default ReceiptTemplate;
