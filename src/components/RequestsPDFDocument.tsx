import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Request, RequestsPDFProps } from '../types/types';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#112233',
    marginBottom: 10,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingBottom: 5,
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
  filterInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  filterText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: '#112233',
    borderBottomWidth: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#112233',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontSize: 9,
  },
  col1: { width: '15%' },
  col2: { width: '25%' },
  col3: { width: '15%' },
  col4: { width: '25%' },
  col5: { width: '20%' },
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
  },
  stats: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
  },
  statBox: {
    alignItems: 'center',
    padding: 10,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#112233',
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 5,
  },
});

// Interface is now imported from types.ts

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

interface RequestsPDFProps {
  requests: Request[];
}

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

export const RequestsPDFDocument = ({ requests }: { requests: Request[] }) => {
  if (!requests || requests.length === 0) {
    return null;
  }

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
              <Text style={styles.tireDetailValue}>BAD-4325</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Order Number:</Text>
              <Text style={styles.tireDetailValue}>BHJ-6767</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Request Date:</Text>
              <Text style={styles.tireDetailValue}>Aug 2, 2025, 08:32 AM</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Order Placed Date:</Text>
              <Text style={styles.tireDetailValue}>Aug 5, 2025, 05:30 AM</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tire Details Section */}
          <View>
            <Text style={styles.tireDetailHeader}>Tire Details</Text>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tire Quantity:</Text>
              <Text style={styles.tireDetailValue}>1</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tubes Quantity:</Text>
              <Text style={styles.tireDetailValue}>-</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tire Size:</Text>
              <Text style={styles.tireDetailValue}>130*90*19*8PR</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Supplier Information */}
          <View>
            <Text style={styles.tireDetailHeader}>Supplier Information</Text>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Supplier Name:</Text>
              <Text style={styles.tireDetailValue}>{requests[0].supplierName || 'Pending Assignment'}</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Phone Number:</Text>
              <Text style={styles.tireDetailValue}>{requests[0].supplierPhone || 'Pending'}</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Email Address:</Text>
              <Text style={styles.tireDetailValue}>{requests[0].supplierEmail || 'Pending'}</Text>
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

        {/* Content */}
        <View style={styles.tireDetailsSection}>
          {/* Request Information Section */}
          <View>
            <Text style={styles.tireDetailHeader}>Request Information</Text>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Vehicle Number:</Text>
              <Text style={styles.tireDetailValue}>BAD-4325</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Order Number:</Text>
              <Text style={styles.tireDetailValue}>BHJ-6767</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Request Date:</Text>
              <Text style={styles.tireDetailValue}>Aug 2, 2025, 08:32 AM</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Order Placed Date:</Text>
              <Text style={styles.tireDetailValue}>Aug 5, 2025, 05:30 AM</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tire Details Section */}
          <View>
            <Text style={styles.tireDetailHeader}>Tire Details</Text>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tire Quantity:</Text>
              <Text style={styles.tireDetailValue}>1</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tubes Quantity:</Text>
              <Text style={styles.tireDetailValue}>-</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tire Size:</Text>
              <Text style={styles.tireDetailValue}>130*90*19*8PR</Text>
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

        {/* Content */}
        <View style={styles.tireDetailsSection}>
          {/* Request Information Section */}
          <View>
            <Text style={styles.tireDetailHeader}>Request Information</Text>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Vehicle Number:</Text>
              <Text style={styles.tireDetailValue}>BAD-4325</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Order Number:</Text>
              <Text style={styles.tireDetailValue}>BHJ-6767</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Request Date:</Text>
              <Text style={styles.tireDetailValue}>Aug 2, 2025, 08:32 AM</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Order Placed Date:</Text>
              <Text style={styles.tireDetailValue}>Aug 5, 2025, 05:30 AM</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tire Details Section */}
          <View>
            <Text style={styles.tireDetailHeader}>Tire Details</Text>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tire Quantity:</Text>
              <Text style={styles.tireDetailValue}>1</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tubes Quantity:</Text>
              <Text style={styles.tireDetailValue}>-</Text>
            </View>
            <View style={styles.tireDetailRow}>
              <Text style={styles.tireDetailLabel}>Tire Size:</Text>
              <Text style={styles.tireDetailValue}>130*90*19*8PR</Text>
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
            <View key={requestItem.id}>
              <View style={styles.tableRow}>
                <Text style={styles.col1}>{requestItem.id}</Text>
                <Text style={styles.col2}>{formatDate(requestItem.requestDate)}</Text>
                <Text style={styles.col3}>{requestItem.status}</Text>
                <Text style={styles.col4}>
                  {requestItem.orderNumber ? `Order #${requestItem.orderNumber}` : 'Pending'}{'\n'}
                  {requestItem.supplierName && `Supplier: ${requestItem.supplierName}`}
                </Text>
                <Text style={styles.col5}>
                  {requestItem.vehicleNumber}{'\n'}
                  {requestItem.tireCount && `${requestItem.tireCount} tire(s)`}
                </Text>
              </View>
              {/* Request Information Section */}
              <View style={styles.tireDetailsSection}>
                <Text style={styles.tireDetailHeader}>Request Information</Text>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Vehicle Number:</Text>
                  <Text style={styles.tireDetailValue}>BAD-4325</Text>
                </View>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Order Number:</Text>
                  <Text style={styles.tireDetailValue}>BHJ-6767</Text>
                </View>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Request Date:</Text>
                  <Text style={styles.tireDetailValue}>Aug 2, 2025, 08:32 AM</Text>
                </View>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Order Placed Date:</Text>
                  <Text style={styles.tireDetailValue}>Aug 5, 2025, 05:30 AM</Text>
                </View>
              </View>

              {/* Tire Details Section */}
              <View style={styles.tireDetailsSection}>
                <Text style={styles.tireDetailHeader}>Tire Details</Text>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Tire Quantity:</Text>
                  <Text style={styles.tireDetailValue}>1</Text>
                </View>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Tubes Quantity:</Text>
                  <Text style={styles.tireDetailValue}>-</Text>
                </View>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Tire Size:</Text>
                  <Text style={styles.tireDetailValue}>130*90*19*8PR</Text>
                </View>
              </View>

              {/* Supplier Information */}
              <View style={styles.tireDetailsSection}>
                <Text style={styles.tireDetailHeader}>Supplier Information</Text>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Supplier Name:</Text>
                  <Text style={styles.tireDetailValue}>-</Text>
                </View>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Phone:</Text>
                  <Text style={styles.tireDetailValue}>-</Text>
                </View>
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Email:</Text>
                  <Text style={styles.tireDetailValue}>-</Text>
                </View>
              </View>

              {/* No technical details section needed */}

                <View style={styles.divider} />
                
                <Text style={styles.tireDetailHeader}>Approval Information</Text>
                
                <View style={styles.tireDetailRow}>
                  <Text style={styles.tireDetailLabel}>Approval Status:</Text>
                  <Text style={styles.tireDetailValue}>{requestItem.approvalStatus || 'N/A'}</Text>
                </View>

                {requestItem.approvalDate && (
                  <View style={styles.tireDetailRow}>
                    <Text style={styles.tireDetailLabel}>Approval Date:</Text>
                    <Text style={styles.tireDetailValue}>{formatDate(requestItem.approvalDate)}</Text>
                  </View>
                )}

                {requestItem.approvedBy && (
                  <View style={styles.tireDetailRow}>
                    <Text style={styles.tireDetailLabel}>Approved By:</Text>
                    <Text style={styles.tireDetailValue}>{requestItem.approvedBy}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by SLT Tire Management System • {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
};
