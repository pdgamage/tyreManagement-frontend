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
    fontFamily: 'Helvetica',
    position: 'relative'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#1a75ff',
    paddingBottom: 15
  },
  logoContainer: {
    width: 150,
    marginRight: 20
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontSize: 24,
    color: '#003366',
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a75ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
    paddingBottom: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  label: {
    width: '35%',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4d4d4d'
  },
  value: {
    width: '65%',
    fontSize: 11,
    color: '#333333'
  },
  highlight: {
    backgroundColor: '#e6f0ff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    paddingTop: 10
  },
  watermark: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '50%',
    left: '50%',
    opacity: 0.08,
    transform: 'translate(-50%, -50%) rotate(-45deg)',
  },
  logo: {
    width: 120,
    height: 'auto',
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

                          {/* Header with Logo */}
                          <View style={styles.header}>
                            <View style={styles.logoContainer}>
                              <Image
                                src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg"
                                style={styles.logo}
                              />
                            </View>
                            <View style={styles.headerContent}>
                              <Text style={styles.title}>Tire Request Report</Text>
                              <Text style={styles.subtitle}>Request ID: {data.id}</Text>
                              <Text style={styles.subtitle}>Generated on: {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</Text>
                            </View>
                          </View>

                          {/* Order Status Highlight */}
                          <View style={styles.highlight}>
                            <View style={styles.row}>
                              <Text style={styles.label}>Order Number:</Text>
                              <Text style={styles.value}>{data.requestInfo.orderNumber || 'Not Assigned'}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Status:</Text>
                              <Text style={styles.value}>{data.status}</Text>
                            </View>
                          </View>

                          {/* Request Information */}
                          <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Request Information</Text>
                            <View style={styles.row}>
                              <Text style={styles.label}>Submitted Date:</Text>
                              <Text style={styles.value}>{data.requestInfo.submittedAt}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Requester Name:</Text>
                              <Text style={styles.value}>{data.requestInfo.requesterName}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Contact Number:</Text>
                              <Text style={styles.value}>{data.requestInfo.requesterPhone}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Email:</Text>
                              <Text style={styles.value}>{data.requestInfo.requesterEmail}</Text>
                            </View>
                          </View>

                          {/* Vehicle Information */}
                          <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Vehicle Information</Text>
                            <View style={styles.row}>
                              <Text style={styles.label}>Vehicle Number:</Text>
                              <Text style={styles.value}>{data.vehicleInfo.number}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Brand & Model:</Text>
                              <Text style={styles.value}>{data.vehicleInfo.brand} {data.vehicleInfo.model}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Department:</Text>
                              <Text style={styles.value}>{data.vehicleInfo.department}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Cost Centre:</Text>
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
                              <Text style={styles.label}>Tubes Quantity:</Text>
                              <Text style={styles.value}>{data.tireDetails.tubesQuantity || 0}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Current Make:</Text>
                              <Text style={styles.value}>{data.tireDetails.existingMake}</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Current KM:</Text>
                              <Text style={styles.value}>{data.tireDetails.currentKm} KM</Text>
                            </View>
                            <View style={styles.row}>
                              <Text style={styles.label}>Last Replacement:</Text>
                              <Text style={styles.value}>{data.tireDetails.lastReplacementDate}</Text>
                            </View>
                          </View>

                          {/* Footer */}
                          <Text style={styles.footer}>
                            This document was generated by SLT Tire Management System on {new Date().toLocaleString()}
                            {'\n'}© {new Date().getFullYear()} Sri Lanka Telecom PLC. All rights reserved.
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
