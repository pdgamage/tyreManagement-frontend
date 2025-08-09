import React, { useState } from 'react';
import { Button } from './ui/button';
import { FileText, Download, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface PdfExportButtonProps {
  document: React.ReactElement;
  fileName: string;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  document,
  fileName,
  buttonText = 'Export PDF',
  variant = 'outline',
  size = 'default',
  className = '',
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Dynamically import PDFViewer only on client-side
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={togglePreview}
        className={`gap-2 ${className}`}
      >
        <FileText className="h-4 w-4" />
        {buttonText}
      </Button>

      {isClient && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>PDF Preview</DialogTitle>
                <div className="flex gap-2">
                  <a
                    href={`data:application/pdf;base64,${btoa(
                      unescape(encodeURIComponent(document))
                    )}`}
                    download={`${fileName}.pdf`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePreview}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`data:application/pdf;base64,${btoa(
                  unescape(encodeURIComponent(document))
                )}`}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PdfExportButton;
