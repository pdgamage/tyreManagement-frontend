import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Request } from '../types/types';

// Create styles
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

interface RequestsPDFProps {
  requests: Request[];
  selectedVehicle: string;
  filters: {
    status: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    searchTerm: string;
  };
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const RequestsPDFDocument: React.FC<RequestsPDFProps> = ({ requests, selectedVehicle, filters }) => {
  // Calculate statistics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status.toLowerCase().includes('pending')).length;
  const approvedRequests = requests.filter(r => r.status.toLowerCase().includes('approved')).length;
  const completedRequests = requests.filter(r => r.status.toLowerCase().includes('complete')).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Tire Request Report</Text>
              <Text style={styles.subtitle}>Vehicle: {selectedVehicle || 'All Vehicles'}</Text>
              <Text style={styles.date}>Generated on: {new Date().toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        {/* Filter Information */}
        <View style={styles.filterInfo}>
          <Text style={styles.filterText}>Status Filter: {filters.status === 'all' ? 'All Statuses' : filters.status}</Text>
          {filters.dateRange.startDate && (
            <Text style={styles.filterText}>
              Date Range: {formatDate(filters.dateRange.startDate)} - {filters.dateRange.endDate ? formatDate(filters.dateRange.endDate) : 'Present'}
            </Text>
          )}
          {filters.searchTerm && (
            <Text style={styles.filterText}>Search Term: {filters.searchTerm}</Text>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalRequests}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{approvedRequests}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedRequests}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Request ID</Text>
            <Text style={styles.col2}>Date</Text>
            <Text style={styles.col3}>Status</Text>
            <Text style={styles.col4}>Order Details</Text>
            <Text style={styles.col5}>Vehicle Info</Text>
          </View>
          
          {requests.map((request) => (
            <View key={request.id}>
              <View style={styles.tableRow}>
                <Text style={styles.col1}>{request.id}</Text>
                <Text style={styles.col2}>{formatDate(request.requestDate)}</Text>
                <Text style={styles.col3}>{request.status}</Text>
                <Text style={styles.col4}>
                  {request.orderNumber ? `Order #${request.orderNumber}` : 'Pending'}{'\n'}
                  {request.supplierName && `Supplier: ${request.supplierName}`}
                </Text>
                <Text style={styles.col5}>
                  {request.vehicleNumber}{'\n'}
                  {request.tireCount && `${request.tireCount} tire(s)`}
                </Text>
              </View>
              {/* Additional Request Details */}
              <View style={{
                backgroundColor: '#f8f9fa',
                padding: 8,
                marginTop: 2,
                marginBottom: 8,
                fontSize: 8
              }}>
                {request.requestDetails && (
                  <Text>Request Details: {request.requestDetails}</Text>
                )}
                {request.comments && (
                  <Text>Comments: {request.comments}</Text>
                )}
                {request.engineerNotes && (
                  <Text>Engineer Notes: {request.engineerNotes}</Text>
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
