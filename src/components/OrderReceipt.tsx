import { format } from 'date-fns';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { FileDown } from 'lucide-react';
import { Order } from '../types/Order';
import { generateReceiptNumber } from '../utils/receiptUtils';

// Helper function to safely format dates
const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '-';
  }
};

// Helper function to safely format currency
const formatCurrency = (amount: number | undefined): string => {
  if (typeof amount !== 'number') return 'LKR 0.00';
  return `LKR ${amount.toFixed(2)}`;
};

// Helper function to safely format kilometer readings
const formatKM = (km: number | undefined | null): string => {
  if (!km) return '-';
  return `${km.toLocaleString()} KM`;
};

// Helper function to safely generate receipt numbers
const generateSafeReceiptNumber = (order: Order): string => {
  try {
    if (!order.submittedAt || !order.vehicleNumber) {
      return `RN-${order.id}`;
    }
    return generateReceiptNumber({
      id: order.id.toString(),
      submittedAt: order.submittedAt,
      vehicleNumber: order.vehicleNumber
    });
  } catch (error) {
    console.warn('Receipt number generation error:', error);
    return `RN-${order.id}`;
  }
};

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 20
  },
  logoSection: {
    width: '50%'
  },
  receiptSection: {
    width: '40%',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 4
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A'
  },
  subHeaderText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4
  },
  companyInfo: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 8
  },
  receiptNumber: {
    fontSize: 12,
    color: '#1D4ED8',
    marginBottom: 4
  },
  dateText: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 4
  },
  section: {
    marginVertical: 10,
    padding: 10
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  label: {
    fontSize: 10,
    color: '#4B5563'
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginVertical: 10
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    minHeight: 25
  },
  tableHeader: {
    backgroundColor: '#f3f4f6'
  },
  tableCell: {
    margin: 'auto',
    padding: 5,
    fontSize: 10
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20
  },
  infoBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  infoText: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 4
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  signatureBox: {
    width: '30%',
    alignItems: 'center'
  },
  signatureLine: {
    fontSize: 12,
    marginBottom: 4
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2
  },
  signatureSubtitle: {
    fontSize: 9,
    color: '#6B7280'
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151'
  },
  footerSubtext: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4
  },
  footerDate: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 4
  }
});

// PDF Document Component
export const OrderReceiptPDF: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            <Text style={styles.headerText}>SLT MOBITEL</Text>
            <Text style={styles.subHeaderText}>Tire Management System</Text>
            <View style={styles.companyInfo}>
              <Text>SLT Mobitel Head Office</Text>
              <Text>Lotus Road, Colombo 01</Text>
              <Text>Sri Lanka</Text>
              <Text>Tel: +94 11 2399399</Text>
            </View>
          </View>
          <View style={styles.receiptSection}>
            <Text style={styles.headerText}>PURCHASE ORDER</Text>
            <Text style={styles.receiptNumber}>
              Receipt No: {generateSafeReceiptNumber(order)}
            </Text>
            <Text style={[styles.label, { marginTop: 8 }]}>
              Date Issued: {formatDate(order.orderPlacedDate)}
            </Text>
            <Text style={styles.label}>Order Reference: #{order.orderNumber || '-'}</Text>
          </View>
        </View>

        {/* Grid Section */}
        <View style={styles.infoGrid}>
          {/* Order Information */}
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <Text style={styles.infoText}>
              Submission Date: {formatDate(order.submittedAt)}
            </Text>
            <Text style={styles.infoText}>
              Order Placed Date: {formatDate(order.orderPlacedDate)}
            </Text>
          </View>
          
          {/* Delivery Information */}
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <Text style={styles.infoText}>Office: {order.deliveryOfficeName || '-'}</Text>
            <Text style={styles.infoText}>Street: {order.deliveryStreetName || '-'}</Text>
            <Text style={styles.infoText}>Town: {order.deliveryTown || '-'}</Text>
          </View>
        </View>

        {/* Second Grid Section */}
        <View style={styles.infoGrid}>
          {/* Requester Details */}
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Requester Details</Text>
            <Text style={styles.infoText}>Name: {order.requesterName}</Text>
            <Text style={styles.infoText}>Contact: {order.requesterPhone}</Text>
          </View>
          
          {/* Vehicle Details */}
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            <Text style={styles.infoText}>Vehicle Number: {order.vehicleNumber}</Text>
            <Text style={styles.infoText}>Make/Model: {order.vehicleBrand} {order.vehicleModel}</Text>
            <Text style={styles.infoText}>Current KM: {formatKM(order.presentKmReading)}</Text>
          </View>
        </View>

        {/* Order Details Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Item Description</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>Make/Size</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Quantity</Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
          </View>
          <View style={[styles.tableRow, { backgroundColor: '#f9fafb' }]}>
            <Text style={[styles.tableCell, { flex: 6 }]}>Existing Tire: {order.existingTireMake || 'N/A'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>New Tires</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{order.tireSize}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{order.quantity}</Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
              {formatCurrency(order.totalPrice)}
            </Text>
          </View>
          {order.tubesQuantity > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Tubes</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{order.tireSize}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{order.tubesQuantity}</Text>
              <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>Included</Text>
            </View>
          )}
          <View style={[styles.tableRow, { backgroundColor: '#f9fafb', fontWeight: 'bold' }]}>
            <Text style={[styles.tableCell, { flex: 4.5, textAlign: 'right' }]}>Total Amount:</Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
              {formatCurrency(order.totalPrice)}
            </Text>
          </View>
        </View>

        {/* Supplier Information */}
        <View style={[styles.infoBox, { marginTop: 20, backgroundColor: '#EFF6FF' }]}>
          <Text style={styles.sectionTitle}>Supplier Information</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.infoText}>Name: {order.supplierName || '-'}</Text>
              <Text style={styles.infoText}>Phone: {order.supplierPhone || '-'}</Text>
            </View>
            <View>
              <Text style={styles.infoText}>Email: {order.supplierEmail || '-'}</Text>
              <Text style={styles.infoText}>Warranty: {formatKM(order.warrantyDistance)}</Text>
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>_________________________</Text>
            <Text style={styles.signatureTitle}>Authorized By</Text>
            <Text style={styles.signatureSubtitle}>Customer Officer</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>_________________________</Text>
            <Text style={styles.signatureTitle}>Requested By</Text>
            <Text style={styles.signatureSubtitle}>{order.requesterName}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>_________________________</Text>
            <Text style={styles.signatureTitle}>Approved By</Text>
            <Text style={styles.signatureSubtitle}>Department Head</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SLT Mobitel - Tire Management System</Text>
          <Text style={styles.footerSubtext}>This is a computer-generated document</Text>
          <Text style={styles.footerDate}>Generated on: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Main component that renders the download button
const OrderReceipt: React.FC<{ order: Order }> = ({ order }) => {
  if (!order) return null;

  return (
    <div className="mb-4">
      <PDFDownloadLink
        document={<OrderReceiptPDF order={order} />}
        fileName={`order-receipt-${order.orderNumber || order.id}.pdf`}
        className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors cursor-pointer"
        style={{ textDecoration: 'none' }}
      >
        {({ loading }) => (
          <>
            <FileDown className="w-5 h-5 mr-2" />
            <span>{loading ? 'Generating receipt...' : 'Download Receipt'}</span>
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
};

export default OrderReceipt;
