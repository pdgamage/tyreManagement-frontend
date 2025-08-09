import React from 'react';
import { X } from 'lucide-react';
import { TireRequest } from '../types/api';
import RequestDetailsPDF from './RequestDetailsPDF';
import { PDFViewer } from '@react-pdf/renderer';

interface PDFPreviewModalProps {
  request: TireRequest;
  isOpen: boolean;
  onClose: () => void;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  request,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/75">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-5xl">
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    PDF Preview
                  </h2>
                  <button
                    onClick={onClose}
                    className="rounded-md bg-gray-100 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="relative flex-1 px-4 py-5">
                  <div className="h-full w-full">
                    <PDFViewer style={{ width: '100%', height: '100%' }}>
                      <RequestDetailsPDF request={request} />
                    </PDFViewer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
