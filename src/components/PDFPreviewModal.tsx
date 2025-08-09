import React from 'react';
import { X } from 'lucide-react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { RequestsPDFDocument } from './RequestsPDFDocument';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: any[];
  selectedVehicle: string;
  filters: {
    status: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    searchTerm: string;
  };
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  requests,
  selectedVehicle,
  filters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Preview PDF Report</h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4" style={{ height: '70vh' }}>
              <PDFViewer width="100%" height="100%" className="border rounded-lg">
                <RequestsPDFDocument
                  requests={requests}
                  selectedVehicle={selectedVehicle}
                  filters={filters}
                />
              </PDFViewer>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <PDFDownloadLink
                document={
                  <RequestsPDFDocument
                    requests={requests}
                    selectedVehicle={selectedVehicle}
                    filters={filters}
                  />
                }
                fileName={`tire-requests-${selectedVehicle || 'all'}-${new Date().toISOString().split('T')[0]}.pdf`}
              >
                {({ loading }) => (
                  <button
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Preparing Download...' : 'Download PDF'}
                  </button>
                )}
              </PDFDownloadLink>
              <button
                type="button"
                className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
