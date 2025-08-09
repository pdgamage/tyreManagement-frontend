import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer';
import { RequestDetails } from '../pages/RequestDetailsPage';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.05,
    left: 0,
    top: 0,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: 10,
  },
  logo: {
    width: 150,
    height: 50,
    objectFit: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a365d',
  },
  subtitle: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d3748',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '40%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  value: {
    width: '60%',
    fontSize: 12,
    color: '#2d3748',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#718096',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
  },
  status: {
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

// Create Document Component
const RequestPdfDocument = ({ request }: { request: RequestDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { backgroundColor: '#c6f6d5', color: '#22543d' }; // green
      case 'pending':
        return { backgroundColor: '#feebc8', color: '#9c4221' }; // yellow
      case 'rejected':
        return { backgroundColor: '#fed7d7', color: '#9b2c2c' }; // red
      default:
        return { backgroundColor: '#e2e8f0', color: '#2d3748' }; // gray
    }
  };

  const statusStyle = getStatusColor(request.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <View style={styles.watermark}>
          <Image src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg" />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Image 
              src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg" 
              style={styles.logo} 
            />
          </View>
          <View>
            <Text style={styles.title}>Tire Request Report</Text>
            <Text style={styles.subtitle}>Generated on: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Request Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Request ID:</Text>
            <Text style={styles.value}>{request.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number:</Text>
            <Text style={styles.value}>{request.orderNumber || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Request Date:</Text>
            <Text style={styles.value}>
              {new Date(request.requestDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text 
              style={[
                styles.value, 
                { 
                  backgroundColor: statusStyle.backgroundColor,
                  color: statusStyle.color,
                  width: 'auto',
                  padding: '2px 6px',
                  borderRadius: 4,
                }
              ]}
            >
              {request.status}
            </Text>
          </View>
        </View>

        {/* Vehicle Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Vehicle Number:</Text>
            <Text style={styles.value}>{request.vehicleNumber}</Text>
          </View>
        </View>

        {/* Tire Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tire Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tire Size:</Text>
            <Text style={styles.value}>{request.tireSize || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.value}>{request.quantity || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tubes Quantity:</Text>
            <Text style={styles.value}>{request.tubesQuantity || 'N/A'}</Text>
          </View>
        </View>

        {/* Supplier Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplier Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Supplier Name:</Text>
            <Text style={styles.value}>{request.supplierName || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>
              {request.supplierPhone || 'N/A'}
              {request.supplierEmail ? ` (${request.supplierEmail})` : ''}
            </Text>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Engineer Name:</Text>
            <Text style={styles.value}>{request.engineerName || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Approval Date:</Text>
            <Text style={styles.value}>
              {request.approvalDate 
                ? new Date(request.approvalDate).toLocaleDateString() 
                : 'N/A'}
            </Text>
          </View>
          {request.remarks && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.label, { marginBottom: 4 }]}>Remarks:</Text>
              <Text style={[styles.value, { fontStyle: 'italic' }]}>
                {request.remarks}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer-generated report. No signature is required.</Text>
          <Text>© {new Date().getFullYear()} SLT Mobitel - Tyre Management System</Text>
        </View>
      </Page>
    </Document>
  );
};

export default RequestPdfDocument;
