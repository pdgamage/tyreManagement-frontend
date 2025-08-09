import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Request } from '../types/types';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#112233',
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#112233',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  date: {
    fontSize: 12,
    color: '#666666',
  },
  tireDetailsSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  tireDetailHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#112233',
    marginBottom: 8,
  },
  tireDetailRow: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 9,
  },
  tireDetailLabel: {
    width: '30%',
    color: '#666666',
  },
  tireDetailValue: {
    width: '70%',
    color: '#112233',
  },
  divider: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
    paddingTop: 10,
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

interface RequestsPDFProps {
  requests: Request[];
}

export const RequestsPDFDocument: React.FC<RequestsPDFProps> = ({ requests }) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  const request = requests[0]; // Get the first request

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>SLT Tire Management System</Text>
              <Text style={styles.subtitle}>Tire Request Details</Text>
              <Text style={styles.date}>Generated on: {new Date().toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.tireDetailsSection}>
          {/* Request Information Section */}
          <View>
            <Text style={styles.tireDetailHeader}>Request Information</Text>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Vehicle Number:</Text>
              <Text style={styles.tireDetailValue}>{request.vehicleNumber}</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Order Number:</Text>
              <Text style={styles.tireDetailValue}>{request.orderNumber || 'Pending'}</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Request Date:</Text>
              <Text style={styles.tireDetailValue}>{formatDate(request.requestDate)}</Text>
            </View>
            {request.orderPlacedDate && (
              <View style={styles.tireDetailRow}>
                <Text style={styles.tireDetailLabel}>Order Placed Date:</Text>
                <Text style={styles.tireDetailValue}>{formatDate(request.orderPlacedDate)}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Tire Details Section */}
          <View>
            <Text style={styles.tireDetailHeader}>Tire Details</Text>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tire Quantity:</Text>
              <Text style={styles.tireDetailValue}>{request.tireCount || 0}</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tubes Quantity:</Text>
              <Text style={styles.tireDetailValue}>{request.tubesQuantity || '-'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Supplier Information */}
          <View>
            <Text style={styles.tireDetailHeader}>Supplier Information</Text>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Supplier Name:</Text>
              <Text style={styles.tireDetailValue}>{request.supplierName || 'Pending Assignment'}</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Phone Number:</Text>
              <Text style={styles.tireDetailValue}>{request.supplierPhone || 'Pending'}</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Email Address:</Text>
              <Text style={styles.tireDetailValue}>{request.supplierEmail || 'Pending'}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by SLT Tire Management System • {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
};
