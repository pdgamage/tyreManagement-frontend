import React from 'react';
import { X } from 'lucide-react';
import { TireRequest } from '../types/api';
import { PDFViewer } from '@react-pdf/renderer';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@react-pdf/renderer';
import { preparePDFData } from '../utils/pdfHelper';

// Register fonts
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf'
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontSize: 12,
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
  watermark: {
    position: 'absolute',
    opacity: 0.1,
    transform: 'rotate(-45deg)',
  },
});

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
  
  const data = preparePDFData(request);

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
                      <Document>
                        <Page size="A4" style={styles.page}>
                          {/* Watermark */}
                          <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg"
                            style={styles.watermark}
                          />

                          {/* Header */}
                          <View style={styles.header}>
                            <Text style={styles.title}>Tire Request Report</Text>
                            <Text style={styles.subtitle}>Request ID: {data.id}</Text>
                            <Text style={styles.subtitle}>Date: {new Date().toLocaleDateString()}</Text>
                          </View>

                          {/* Request Information */}
                          <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Request Information</Text>
                            <View style={styles.row}>
                              <Text style={styles.label}>Status:</Text>
                              <Text style={styles.value}>{data.status}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Submitted:</Text>
                              <Text style={styles.value}>{data.requestInfo.submittedAt}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Requester:</Text>
                              <Text style={styles.value}>{data.requestInfo.requesterName}</Text>
                            </View>
                          </View>

                          {/* Vehicle Information */}
                          <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Vehicle Information</Text>
                            <View style={styles.row}>
                              <Text style={styles.label}>Number:</Text>
                              <Text style={styles.value}>{data.vehicleInfo.number}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Department:</Text>
                              <Text style={styles.value}>{data.vehicleInfo.department}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Section:</Text>
                              <Text style={styles.value}>{data.vehicleInfo.section}</Text>
                            </View>
                          </View>

                          {/* Tire Details */}
                          <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tire Details</Text>
                            <View style={styles.row}>
                              <Text style={styles.label}>Size Required:</Text>
                              <Text style={styles.value}>{data.tireDetails.sizeRequired}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Quantity:</Text>
                              <Text style={styles.value}>{data.tireDetails.quantity}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Current Make:</Text>
                              <Text style={styles.value}>{data.tireDetails.existingMake}</Text>
                            </View>
                          </View>

                          {/* Footer */}
                          <Text style={styles.footer}>
                            Generated by SLT TMS on {new Date().toLocaleString()}
                          </Text>
                        </Page>
                      </Document>
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
