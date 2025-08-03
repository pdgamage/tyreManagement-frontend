import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import VehicleRequestFilter from '../components/VehicleRequestFilter';

const VehicleRequestSearchPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Vehicle Request Search
      </Typography>
      <Paper elevation={0}>
        <VehicleRequestFilter />
      </Paper>
    </Box>
  );
};

export default VehicleRequestSearchPage;
