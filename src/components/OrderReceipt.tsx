import { format } from 'date-fns';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Order } from '../types/Order';

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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
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
});

// PDF Document Component
const OrderReceiptPDF: React.FC<{ order: Order }> = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>TIRE ORDER RECEIPT</Text>
      </View>

      {/* Company Information */}
      <View style={styles.companyInfo}>
        <Text style={styles.value}>Sri Lanka Transport Board</Text>
        <Text style={styles.label}>Order Number: {order.orderNumber}</Text>
        <Text style={styles.label}>Date: {format(new Date(order.orderPlacedDate), 'dd/MM/yyyy')}</Text>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.value}>Requester Information</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{order.requesterName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{order.userSection}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cost Center:</Text>
            <Text style={styles.value}>{order.costCenter}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>{order.requesterPhone}</Text>
          </View>
        </View>
      </View>

      {/* Vehicle Information */}
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

      {/* Order Details */}
      <View style={styles.section}>
        <Text style={styles.value}>Order Details</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Tire Size:</Text>
            <Text style={styles.value}>{order.tireSize}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.value}>{order.quantity}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Tubes Quantity:</Text>
            <Text style={styles.value}>{order.tubesQuantity}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Warranty Distance:</Text>
            <Text style={styles.value}>{`${order.warrantyDistance} km`}</Text>
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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        {({ loading }) =>
          loading ? 'Generating receipt...' : 'Download Receipt'
        }
      </PDFDownloadLink>
    </div>
  );
};

export default OrderReceipt;
