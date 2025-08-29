import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileDown } from 'lucide-react';
import OrderReceipt from './OrderReceipt'; // Assuming OrderReceipt is in the same directory
import type { Order } from '../types/Order';

interface PdfDownloaderProps {
  order: Order;
  fileName: string;
}

const PdfDownloader: React.FC<PdfDownloaderProps> = ({ order, fileName }) => {
  return (
    <PDFDownloadLink
      document={<OrderReceipt order={order} />}
      fileName={fileName}
      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors shadow-sm cursor-pointer"
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <>
          <FileDown className="w-5 h-5 mr-2" />
          <span>{loading ? 'Preparing...' : 'Download PDF'}</span>
        </>
      )}
    </PDFDownloadLink>
  );
};

export default PdfDownloader;
