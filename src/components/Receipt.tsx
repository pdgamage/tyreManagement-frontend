import React from 'react';
import { format } from 'date-fns';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface ReceiptProps {
  request: {
    id: number;
    orderNumber: string | null;
    requesterName: string;
    requesterEmail: string;
    requesterPhone: string;
    vehicleNumber: string;
    vehicleBrand: string;
    vehicleModel: string;
    quantity: number;
    tubesQuantity: number;
    tireSize: string;
    totalPrice: number | null;
    userSection: string | null;
    costCenter: string | null;
    supplierName: string | null;
    supplierEmail: string | null;
    supplierPhone: string | null;
    submittedAt: string | Date;
    orderPlacedDate: string | Date | null;
    status?: string;
  };
}

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  row: {
    flexDirection: 'row',
    marginVertical: 5
  },
  label: {
    width: 200,
    fontWeight: 'bold'
  },
  value: {
    flex: 1
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginVertical: 10
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666'
  }
});

// PDF Document component
const ReceiptPDF: React.FC<ReceiptProps> = ({ request }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Tire Order Receipt</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Receipt Number:</Text>
          <Text style={styles.value}>R{String(request.id).padStart(6, '0')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Order Number:</Text>
          <Text style={styles.value}>{request.orderNumber}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Requester Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{request.requesterName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{request.requesterEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{request.requesterPhone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Department:</Text>
          <Text style={styles.value}>{request.userSection}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cost Center:</Text>
          <Text style={styles.value}>{request.costCenter}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Vehicle Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Vehicle Number:</Text>
          <Text style={styles.value}>{request.vehicleNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Brand:</Text>
          <Text style={styles.value}>{request.vehicleBrand}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Model:</Text>
          <Text style={styles.value}>{request.vehicleModel}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Order Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tire Size:</Text>
          <Text style={styles.value}>{request.tireSize}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tire Quantity:</Text>
          <Text style={styles.value}>{request.quantity}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tube Quantity:</Text>
          <Text style={styles.value}>{request.tubesQuantity}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Price:</Text>
          <Text style={styles.value}>LKR {request.totalPrice?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Supplier Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Supplier Name:</Text>
          <Text style={styles.value}>{request.supplierName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Supplier Email:</Text>
          <Text style={styles.value}>{request.supplierEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Supplier Phone:</Text>
          <Text style={styles.value}>{request.supplierPhone}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Dates</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Submitted Date:</Text>
          <Text style={styles.value}>{format(new Date(request.submittedAt), 'dd/MM/yyyy HH:mm')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Order Placed Date:</Text>
          <Text style={styles.value}>
            {request.orderPlacedDate 
              ? format(new Date(request.orderPlacedDate), 'dd/MM/yyyy HH:mm')
              : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>This is a computer-generated receipt. No signature required.</Text>
      </View>
    </Page>
  </Document>
);

const Receipt: React.FC<ReceiptProps> = ({ request }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="text-3xl font-bold text-center mb-8">
        Tire Order Receipt
      </div>

      {/* Receipt and Order Numbers */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <span className="font-bold">Receipt Number: </span>
          <span>R{String(request.id).padStart(6, '0')}</span>
        </div>
        <div>
          <span className="font-bold">Order Number: </span>
          <span>{request.orderNumber}</span>
        </div>
      </div>

      {/* Requester Details */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Requester Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-semibold">Name:</span> {request.requesterName}</div>
          <div><span className="font-semibold">Email:</span> {request.requesterEmail}</div>
          <div><span className="font-semibold">Phone:</span> {request.requesterPhone}</div>
          <div><span className="font-semibold">Department:</span> {request.userSection}</div>
          <div><span className="font-semibold">Cost Center:</span> {request.costCenter}</div>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Vehicle Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-semibold">Vehicle Number:</span> {request.vehicleNumber}</div>
          <div><span className="font-semibold">Brand:</span> {request.vehicleBrand}</div>
          <div><span className="font-semibold">Model:</span> {request.vehicleModel}</div>
        </div>
      </div>

      {/* Order Details */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Order Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-semibold">Tire Size:</span> {request.tireSize}</div>
          <div><span className="font-semibold">Tire Quantity:</span> {request.quantity}</div>
          <div><span className="font-semibold">Tube Quantity:</span> {request.tubesQuantity}</div>
          <div><span className="font-semibold">Total Price:</span> LKR {request.totalPrice?.toFixed(2) || '0.00'}</div>
        </div>
      </div>

      {/* Supplier Details */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Supplier Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-semibold">Supplier Name:</span> {request.supplierName}</div>
          <div><span className="font-semibold">Supplier Email:</span> {request.supplierEmail}</div>
          <div><span className="font-semibold">Supplier Phone:</span> {request.supplierPhone}</div>
        </div>
      </div>

      {/* Dates */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Dates</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Submitted Date:</span>{' '}
            {format(new Date(request.submittedAt), 'dd/MM/yyyy HH:mm')}
          </div>
          <div>
            <span className="font-semibold">Order Placed Date:</span>{' '}
            {request.orderPlacedDate 
              ? format(new Date(request.orderPlacedDate), 'dd/MM/yyyy HH:mm')
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="mt-8 flex justify-center">
        <PDFDownloadLink
          document={<ReceiptPDF request={request} />}
          fileName={`receipt_${request.orderNumber}.pdf`}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {({ loading }) =>
            loading ? 'Preparing Download...' : 'Download Receipt as PDF'
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default Receipt;
