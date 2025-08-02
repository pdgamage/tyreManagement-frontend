import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Autosuggest from 'react-autosuggest';
import { Card, CardContent, Typography, Box, Button, CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../config/api';
import { Vehicle, VehicleRequest, SupplierDetails, SuggestionsFetchRequest, AutosuggestProps } from '../types/vehicle';

const VehicleRequestSearch = () => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);

  // Function to fetch vehicle suggestions
  const fetchSuggestions = async (value) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vehicles/search?query=${value}`);
      return response.data.map(vehicle => vehicle.vehicleNumber);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  // Autosuggest input props
  const inputProps = {
    placeholder: 'Enter vehicle number',
    value: vehicleNumber,
    onChange: (_, { newValue }) => setVehicleNumber(newValue),
  };

  // Autosuggest callbacks
  const onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await fetchSuggestions(value);
    setSuggestions(suggestions);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  // Search function
  const handleSearch = async () => {
    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle number');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/requests/search/vehicle/${vehicleNumber}`);
      setSearchResult(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error searching for vehicle requests');
    } finally {
      setLoading(false);
    }
  };

  // Render suggestions
  const renderSuggestion = (suggestion) => (
    <div className="suggestion-item">
      {suggestion}
    </div>
  );

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
    <div>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Vehicle Request Search
          </Typography>
          
          <Box display="flex" gap={2} mb={3}>
            <Box flexGrow={1}>
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={suggestion => suggestion}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps}
                theme={{
                  input: 'MuiInputBase-input',
                  suggestionsContainer: 'suggestions-container',
                  suggestionsList: 'suggestions-list',
                  suggestion: 'suggestion'
                }}
              />
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSearch}
              disabled={loading || !vehicleNumber.trim()}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>

          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}

          {searchResult && searchResult.map((request, index) => (
            <Card key={request.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Request #{request.id}
                </Typography>
                <Typography>Status: {request.status}</Typography>
                <Typography>Submitted: {new Date(request.submittedAt).toLocaleString()}</Typography>
                <Typography>Reason: {request.requestReason}</Typography>
                {request.status === 'order placed' && renderSupplierDetails(request.supplierDetails)}
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
        .suggestion {
          padding: 8px 16px;
          cursor: pointer;
        }
        .suggestion:hover {
          background-color: #f5f5f5;
        }
        .MuiInputBase-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default VehicleRequestSearch;
