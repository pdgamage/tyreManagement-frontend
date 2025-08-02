import React, { useState } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FilterList as FilterListIcon, Sort as SortIcon } from '@mui/icons-material';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const RequestFilter = () => {
  // State for form fields
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Status options
  const statusOptions = [
    "pending",
    "supervisor approved",
    "technical-manager approved",
    "engineer approved",
    "customer-officer approved",
    "approved",
    "rejected",
    "complete",
    "order placed",
  ];

  // Function to fetch vehicle suggestions
  const fetchSuggestions = async (value) => {
    if (!value) return [];
    try {
      const response = await axios.get(`${API_BASE_URL}/requests/vehicles/search?query=${value}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  // Autosuggest handlers
  const onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await fetchSuggestions(value);
    setSuggestions(suggestions);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion) => (
    <div className="suggestion-item">
      {suggestion}
    </div>
  );

  // Search function
  const handleSearch = async () => {
    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE_URL}/requests/search/vehicle/${vehicleNumber}?`;
      
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      url += params.toString();

      const response = await axios.get(url);
      setRequests(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error searching for requests');
    } finally {
      setLoading(false);
    }
  };

  // Render supplier details
  const renderSupplierDetails = (supplierDetails) => {
    if (!supplierDetails) return null;

    return (
      <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
        <Typography variant="h6">Supplier Details</Typography>
        <Typography>Name: {supplierDetails.name}</Typography>
        <Typography>Email: {supplierDetails.email}</Typography>
        <Typography>Phone: {supplierDetails.phone}</Typography>
        <Typography>Order Number: {supplierDetails.orderNumber}</Typography>
        <Typography>Order Notes: {supplierDetails.orderNotes}</Typography>
        <Typography>Order Date: {new Date(supplierDetails.orderTimestamp).toLocaleString()}</Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Vehicle Request Filter</Typography>
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
                <FilterListIcon />
              </Tooltip>
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={{
                  placeholder: 'Enter vehicle number',
                  value: vehicleNumber,
                  onChange: (_, { newValue }) => setVehicleNumber(newValue),
                  className: 'MuiInputBase-input'
                }}
              />
            </Grid>

            {showFilters && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      {statusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="submittedAt">Submitted Date</MenuItem>
                      <MenuItem value="status">Status</MenuItem>
                      <MenuItem value="order_timestamp">Order Date</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    startIcon={<SortIcon />}
                    onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                  >
                    {sortOrder === 'ASC' ? 'Ascending' : 'Descending'}
                  </Button>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={loading || !vehicleNumber.trim()}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" mt={2}>
              {error}
            </Typography>
          )}

          {requests.map((request) => (
            <Card key={request.id} sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6">Request #{request.id}</Typography>
                <Typography>Status: {request.status}</Typography>
                <Typography>
                  Submitted: {new Date(request.submittedAt).toLocaleString()}
                </Typography>
                <Typography>Reason: {request.requestReason}</Typography>
                {request.status === 'order placed' && 
                  renderSupplierDetails(request.supplierDetails)}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <style jsx>{`
        .suggestions-container {
          position: absolute;
          z-index: 1;
          background: white;
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
        }
        .suggestions-list {
          margin: 0;
          padding: 0;
          list-style-type: none;
        }
        .suggestion-item {
          padding: 8px 16px;
          cursor: pointer;
        }
        .suggestion-item:hover {
          background-color: #f5f5f5;
        }
        .MuiInputBase-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      `}</style>
    </Box>
  );
};

export default RequestFilter;
