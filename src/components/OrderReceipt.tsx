import { format } from 'date-fns';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { FileDown } from 'lucide-react';
import { Order } from '../types/Order';
import { generateReceiptNumber } from '../utils/receiptUtils';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  receiptNumber: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#4b5563',
    marginTop: 5,
  },
  companyInfo: {
    marginBottom: 20,
    padding: 10,
    borderBottom: '1px solid #ccc',
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.receiptNumber}>Receipt No: {generateReceiptNumber({ ...order, id: order.id.toString() })}</Text>
        <Text style={styles.headerText}>SLT MOBITEL</Text>
        <Text style={styles.subHeaderText}>Tire Management System</Text>
      </View>

      {/* Company Information */}
          <View style={styles.companyInfo}>
            <Text style={styles.value}>SLT Mobitel - Official Purchase Order</Text>
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
