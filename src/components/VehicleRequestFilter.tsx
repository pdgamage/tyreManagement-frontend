import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import LoadingSpinner from './LoadingSpinner';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.spacing(2),
  backgroundColor: '#ffffff',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
  },
  transition: 'box-shadow 0.3s ease-in-out',
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const ResultCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const StatusChip = styled(Chip)(({ theme, status }: { theme: any, status: string }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: 
    status === 'complete' ? theme.palette.success.light :
    status === 'order placed' ? theme.palette.info.light :
    status === 'rejected' ? theme.palette.error.light :
    theme.palette.warning.light,
}));

interface Vehicle {
  id: number;
  vehicleNumber: string;
}

interface Request {
  id: number;
  vehicleNumber: string;
  status: string;
  submittedAt: string;
  orderNumber?: string;
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
}

const VehicleRequestFilter: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Vehicle[]>([]);
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Fetch registered vehicles on component mount
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles');
      setVehicles(response.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const getSuggestions = (inputValue: string) => {
    const inputValueLower = inputValue.toLowerCase();
    return vehicles.filter(vehicle =>
      vehicle.vehicleNumber.toLowerCase().includes(inputValueLower)
    );
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const searchVehicle = async () => {
    if (!value) {
      setError('Please enter a vehicle number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/requests/vehicle/${value}`);
      if (response.data) {
        setRequest(response.data);
        setShowDialog(true);
      } else {
        setError('No requests found for this vehicle');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error searching for vehicle requests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 'bold' }}>
          Search Vehicle Requests
        </Typography>
        
        <SearchContainer>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={(suggestion) => suggestion.vehicleNumber}
            renderSuggestion={(suggestion) => (
              <Box p={1}>
                <Typography>{suggestion.vehicleNumber}</Typography>
              </Box>
            )}
            inputProps={{
              placeholder: 'Enter vehicle number',
              value,
              onChange: (_, { newValue }) => setValue(newValue),
            }}
            renderInputComponent={(inputProps) => (
              <TextField
                {...inputProps}
                variant="outlined"
                fullWidth
                error={!!error}
                helperText={error}
              />
            )}
            theme={{
              container: 'autosuggest-container',
              input: 'form-control',
              suggestionsContainer: 'dropdown-menu',
              suggestionsList: 'dropdown-menu-list',
              suggestion: 'dropdown-item',
              suggestionHighlighted: 'dropdown-item-highlighted',
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={searchVehicle}
            startIcon={<SearchIcon />}
            disabled={loading}
          >
            Search
          </Button>
        </SearchContainer>

        {loading && <LoadingSpinner />}

        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Vehicle Request Details
          </DialogTitle>
          <DialogContent>
            {request && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    Vehicle Number: {request.vehicleNumber}
                  </Typography>
                  <StatusChip
                    label={request.status}
                    status={request.status}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Submitted: {formatDate(request.submittedAt)}
                  </Typography>
                </Grid>

                {request.status === 'order placed' && (
                  <>
                    <Grid item xs={12}>
                      <Divider />
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        Order Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        Order Number: {request.orderNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        Supplier Details
                      </Typography>
                      <Typography variant="body1">
                        Name: {request.supplierName}
                      </Typography>
                      <Typography variant="body1">
                        Email: {request.supplierEmail}
                      </Typography>
                      <Typography variant="body1">
                        Phone: {request.supplierPhone}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </StyledCard>
  );
};

export default VehicleRequestFilter;
