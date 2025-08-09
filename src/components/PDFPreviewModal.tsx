import React, { useState, useEffect } from 'react';
import { X, Download, Printer } from 'lucide-react';

interface PdfPreviewModalProps {
  pdfUrl: string;
  fileName: string;
  onClose: () => void;
  onDownload: () => void;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  pdfUrl,
  fileName,
  onClose,
  onDownload,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setError('Failed to load PDF preview. You can still download the report.');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Document</title>
            <style>
              body { margin: 0; padding: 20px; }
              iframe { width: 100%; height: 100vh; border: none; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <iframe src="${pdfUrl}" onload="window.focus(); window.print();"></iframe>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Preview Report: {fileName}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-100"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg max-w-md">
                <p>{error}</p>
                <button
                  onClick={onDownload}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </button>
              </div>
            </div>
          )}
          
          <iframe
            src={pdfUrl}
            className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Failed to load PDF preview. You can still download the report.');
              setIsLoading(false);
            }}
            title="PDF Preview"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Review the report before downloading or printing.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={onDownload}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;