import React, { useState, useEffect, useCallback } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  FormControl, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  TextField, 
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Search, Refresh, Description, ConfirmationNumber } from '@mui/icons-material';
import VehicleRequestDetailsModal from './VehicleRequestDetailsModal';
import { apiRequest } from '../utils/api';

interface VehicleRequest {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
  vehicle_number: string;
  vehicle_brand: string;
  vehicle_model: string;
  supplier_name: string;
  supplier_phone: string;
  supplier_email: string;
  supplier_contact: string;
  tire_size: string;
  quantity: number;
  request_reason: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  images?: Array<{
    id: number;
    image_url: string;
    created_at: string;
  }>;
  notes?: string;
  updated_at: string;
  updated_by?: string;
  cost_center?: string;
  user_section?: string;
}

const VehicleInquiry: React.FC = () => {
  const [vehicles, setVehicles] = useState<{id: number, vehicle_number: string}[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
    const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<VehicleRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  // Fetch all vehicle numbers
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await apiRequest('GET', '/api/vehicles');
        setVehicles(response || []);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicle list. Please try again later.');
      }
    };

    fetchVehicles();
  }, []);

  const handleSearch = async () => {
    if (!selectedVehicle) {
      setError('Please select a vehicle number');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      let url = `/api/requests/vehicle/${encodeURIComponent(selectedVehicle)}`;
      
      if (startDate && endDate) {
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        url += `?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`;
      }

      const response = await apiRequest('GET', url);
      setRequests(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to fetch requests. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedVehicle('');
    setStartDate(null);
    setEndDate(null);
    setRequests([]);
    setError(null);
    setSearchPerformed(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'primary';
      case 'in progress':
        return 'info';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (request: VehicleRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const exportToExcel = useCallback(() => {
    if (requests.length === 0) return;
    
    setExporting(true);
    
    try {
      const data = requests.map(request => ({
        'Order #': request.order_number || 'N/A',
        'Request Date': formatDate(request.created_at),
        'Status': request.status,
        'Vehicle Number': request.vehicle_number,
        'Vehicle': `${request.vehicle_brand || ''} ${request.vehicle_model || ''}`.trim(),
        'Tire Size': request.tire_size,
        'Quantity': request.quantity,
        'Supplier': request.supplier_name || 'N/A',
        'Supplier Contact': request.supplier_contact || 'N/A',
        'Supplier Phone': request.supplier_phone || 'N/A',
        'Supplier Email': request.supplier_email || 'N/A',
        'Request Reason': request.request_reason,
        'Requester': request.requester_name,
        'Requester Email': request.requester_email,
        'Requester Phone': request.requester_phone,
        'Last Updated': formatDate(request.updated_at)
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tire Requests');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save file
      saveAs(blob, `tire_requests_${selectedVehicle}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [requests, selectedVehicle]);

  // Loading skeleton
  const renderSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ width: '30%', height: 24, bgcolor: 'grey.300', borderRadius: 1 }} />
                <Box sx={{ width: '15%', height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: '20%', height: 20, bgcolor: 'grey.200', borderRadius: 1 }} />
                <Box sx={{ width: '15%', height: 20, bgcolor: 'grey.200', borderRadius: 1 }} />
                <Box sx={{ width: '25%', height: 20, bgcolor: 'grey.200', borderRadius: 1 }} />
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center">
              <Description color="primary" sx={{ mr: 1 }} />
              Vehicle Inquiry
            </Box>
          </Typography>
          
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel id="vehicle-select-label">Vehicle Number</InputLabel>
                <Select
                  labelId="vehicle-select-label"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value as string)}
                  label="Vehicle Number"
                >
                  <MenuItem value="">
                    <em>Select a vehicle</em>
                  </MenuItem>
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.vehicle_number}>
                      {vehicle.vehicle_number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={startDate || undefined}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={!selectedVehicle || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                fullWidth
              >
                Search
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={loading}
                startIcon={<Refresh />}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading && renderSkeleton()}
          
          {searchPerformed && !loading && requests.length === 0 && !error && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No requests found for the selected criteria.
            </Alert>
          )}
          
          {!loading && requests.length > 0 && (
            <Box mt={4}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Request History
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={exportToExcel} 
                  disabled={exporting || requests.length === 0}
                  startIcon={exporting ? <CircularProgress size={20} /> : null}
                >
                  {exporting ? 'Exporting...' : 'Export to Excel'}
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Request Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.order_number || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={request.status} 
                            color={getStatusColor(request.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{request.supplier_name || 'N/A'}</TableCell>
                        <TableCell>
                          {request.supplier_contact ? (
                            <Box>
                              <div>{request.supplier_contact}</div>
                              <div>{request.supplier_phone}</div>
                              <div>{request.supplier_email}</div>
                            </Box>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <div><strong>Tire Size:</strong> {request.tire_size}</div>
                            <div><strong>Quantity:</strong> {request.quantity}</div>
                            <div style={{ marginTop: 8 }}>
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(request);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box mt={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      {selectedRequest && (
        <VehicleRequestDetailsModal 
          open={isModalOpen}
          onClose={handleCloseModal}
          request={selectedRequest}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      )}
    </Container>
  );
};

export default VehicleInquiry;
