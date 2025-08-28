import { format } from 'date-fns';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { FileDown } from 'lucide-react';
import { Order } from '../types/Order';
import { generateReceiptNumber } from '../utils/receiptUtils';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 20,
  },
  logoSection: {
    width: '50%',
  },
  receiptSection: {
    width: '40%',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  companyInfo: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 8,
  },
  receiptNumber: {
    fontSize: 12,
    color: '#1D4ED8',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: '#4B5563',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 4,
  },
  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
    padding: 4,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  signatureBox: {
    width: '30%',
    alignItems: 'center',
  },
  signatureLine: {
    fontSize: 12,
    marginBottom: 4,
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  signatureSubtitle: {
    fontSize: 9,
    color: '#6B7280',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  footerDate: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  value: {
    fontSize: 12,
    color: '#000',
  },
  total: {
    marginTop: 20,
    borderTop: '2px solid #000',
    paddingTop: 10,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
  },
  // New table styles
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginVertical: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    minHeight: 25,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableCell: {
    margin: 'auto',
    padding: 5,
    fontSize: 10,
  },
});

// PDF Document Component
const OrderReceiptPDF: React.FC<{ order: Order }> = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Logo and Receipt Info */}
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
          <Text style={styles.receiptNumber}>Receipt No: {generateReceiptNumber({ ...order, id: order.id.toString() })}</Text>
          <Text style={[styles.label, { marginTop: 8 }]}>Date Issued: {format(new Date(order.orderPlacedDate), 'dd/MM/yyyy')}</Text>
          <Text style={styles.label}>Order Reference: #{order.orderNumber}</Text>
        </View>
      </View>

      {/* Order and Delivery Info */}
      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <Text style={styles.infoText}>Submission Date: {format(new Date(order.submittedAt), 'dd/MM/yyyy')}</Text>
          <Text style={styles.infoText}>Processing Date: {format(new Date(order.orderPlacedDate), 'dd/MM/yyyy')}</Text>
          <Text style={styles.infoText}>Department: {order.userSection || '-'}</Text>
          <Text style={styles.infoText}>Cost Center: {order.costCenter || '-'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <Text style={styles.infoText}>Office: {order.deliveryOfficeName || '-'}</Text>
          <Text style={styles.infoText}>Street: {order.deliveryStreetName || '-'}</Text>
          <Text style={styles.infoText}>Town: {order.deliveryTown || '-'}</Text>
        </View>
      </View>

      {/* Requester and Vehicle Info */}
      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>Requester Details</Text>
          <Text style={styles.infoText}>Name: {order.requesterName}</Text>
          <Text style={styles.infoText}>Contact: {order.requesterPhone}</Text>
          <Text style={styles.infoText}>Department: {order.userSection}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <Text style={styles.infoText}>Vehicle Number: {order.vehicleNumber}</Text>
          <Text style={styles.infoText}>Make/Model: {order.vehicleBrand} {order.vehicleModel}</Text>
          <Text style={styles.infoText}>Current KM: {order.presentKmReading?.toLocaleString() || '-'}</Text>
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
          <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>LKR {order.totalPrice.toFixed(2)}</Text>
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
          <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>LKR {order.totalPrice.toFixed(2)}</Text>
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
            <Text style={styles.infoText}>Warranty: {order.warrantyDistance ? `${order.warrantyDistance.toLocaleString()} KM` : '-'}</Text>
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
            <Text style={styles.label}>Receipt No: {generateReceiptNumber({ ...order, id: order.id.toString() })}</Text>
            <Text style={styles.label}>Request ID: #{order.id}</Text>
            <Text style={styles.label}>Date Submitted: {format(new Date(order.submittedAt), 'dd/MM/yyyy')}</Text>
            <Text style={styles.label}>Date Order Placed: {order.orderPlacedDate ? format(new Date(order.orderPlacedDate), 'dd/MM/yyyy') : '-'}</Text>
          </View>        {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.value}>Requester Information</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{order.requesterName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>{order.requesterPhone}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{order.userSection}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Cost Center:</Text>
            <Text style={styles.value}>{order.costCenter}</Text>
          </View>
        </View>
      </View>

      {/* Delivery Information */}
      <View style={styles.section}>
        <Text style={styles.value}>Delivery Information</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Office:</Text>
            <Text style={styles.value}>{order.deliveryOfficeName || '-'}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Street:</Text>
            <Text style={styles.value}>{order.deliveryStreetName || '-'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Town:</Text>
            <Text style={styles.value}>{order.deliveryTown || '-'}</Text>
          </View>
        </View>
      </View>

      {/* Request Details */}
      <View style={styles.section}>
        <Text style={styles.value}>Request Details</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Request Reason:</Text>
            <Text style={styles.value}>{order.requestReason || '-'}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Existing Tire Make:</Text>
            <Text style={styles.value}>{order.existingTireMake || '-'}</Text>
          </View>
        </View>
      </View>      {/* Vehicle Information */}
      <View style={styles.section}>
        <Text style={styles.value}>Vehicle Information</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Vehicle Number:</Text>
            <Text style={styles.value}>{order.vehicleNumber}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Brand/Model:</Text>
            <Text style={styles.value}>{`${order.vehicleBrand} ${order.vehicleModel}`}</Text>
          </View>
        </View>
      </View>

      {/* Order Details Table */}
      <View style={styles.section}>
        <Text style={styles.value}>Order Details</Text>
        {/* Existing Tire Info */}
        <View style={[styles.row, { backgroundColor: '#f9fafb', padding: 8, marginBottom: 8 }]}>
          <Text style={styles.label}>Existing Tire Make: {order.existingTireMake || 'N/A'}</Text>
        </View>
        {/* New Items Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Item Description</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>Make/Size</Text>
            <Text style={[styles.tableCell, { flex: 0.5 }]}>Qty</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>New Tires</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{order.tireSize}</Text>
            <Text style={[styles.tableCell, { flex: 0.5 }]}>{order.quantity}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
              {`LKR ${order.totalPrice.toFixed(2)}`}
            </Text>
          </View>
          {order.tubesQuantity > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Tubes</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{order.tireSize}</Text>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{order.tubesQuantity}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Included</Text>
            </View>
          )}
          <View style={[styles.tableRow, { borderTopWidth: 1, marginTop: 4 }]}>
            <Text style={[styles.tableCell, { flex: 3.5, textAlign: 'right', fontWeight: 'bold' }]}>Total:</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>
              {`LKR ${order.totalPrice.toFixed(2)}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Supplier Information */}
      <View style={styles.section}>
        <Text style={styles.value}>Supplier Information</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Supplier Name:</Text>
            <Text style={styles.value}>{order.supplierName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>{order.supplierPhone}</Text>
          </View>
        </View>
      </View>

      {/* Total */}
      <View style={styles.total}>
        <Text>Total Amount: LKR {order.totalPrice.toFixed(2)}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>This is a computer-generated receipt. No signature is required.</Text>
      </View>
    </Page>
  </Document>
);

// Main Component
const OrderReceipt: React.FC<{ order: Order }> = ({ order }) => {
  if (!order) return null;

  return (
    <div className="mb-4">
      <PDFDownloadLink
        document={<OrderReceiptPDF order={order} />}
        fileName={`order-receipt-${order.orderNumber}.pdf`}
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
