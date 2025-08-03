import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalShipping as VehicleIcon,
  ConfirmationNumber as OrderIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Event as DateIcon,
  Description as NotesIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Build as InProgressIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { TireRequest } from '../types/api';

interface VehicleRequestDetailsModalProps {
  open: boolean;
  onClose: () => void;
  request: TireRequest | null;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
}

const VehicleRequestDetailsModal: React.FC<VehicleRequestDetailsModalProps> = ({
  open,
  onClose,
  request,
  formatDate,
  getStatusColor
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!request) return null;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <ApprovedIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'rejected':
        return <RejectedIcon color="error" />;
      case 'in progress':
        return <InProgressIcon color="info" />;
      case 'completed':
        return <ApprovedIcon color="success" />;
      default:
        return <PendingIcon />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          [theme.breakpoints.up('md')]: {
            minHeight: '70vh',
            maxHeight: '90vh'
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 2,
          pl: 3
        }}
      >
        <Box display="flex" alignItems="center">
          <VehicleIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Request Details - {request.vehicle_number}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <Grid container spacing={0}>
          {/* Left Side - Request Details */}
          <Grid item xs={12} md={6} sx={{ p: 3 }}>
            <Box mb={3}>
              <Box display="flex" alignItems="center" mb={2}>
                <Chip
                  icon={getStatusIcon(request.status || '')}
                  label={request.status || 'N/A'}
                  color={getStatusColor(request.status || '') as any}
                  size="medium"
                  sx={{ fontSize: '0.875rem', fontWeight: 600, py: 1 }}
                />
                <Box ml="auto">
                  <Chip
                    icon={<OrderIcon />}
                    label={`Order #${request.order_number || 'N/A'}`}
                    variant="outlined"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              </Box>
              
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Requested on {formatDate(request.created_at)}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Vehicle Information
              </Typography>
              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <VehicleIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${request.vehicle_brand || ''} ${request.vehicle_model || ''}`.trim() || 'N/A'}
                    secondary="Vehicle"
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ConfirmationNumber fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={request.vehicle_number || 'N/A'}
                    secondary="Registration Number"
                  />
                </ListItem>
              </List>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Tire Details
              </Typography>
              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemText 
                    primary={request.tire_size || 'N/A'}
                    secondary="Tire Size"
                  />
                  <ListItemText 
                    primary={request.quantity || 'N/A'}
                    secondary="Quantity"
                    sx={{ textAlign: 'right' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText 
                    primary={request.request_reason || 'N/A'}
                    secondary="Reason for Request"
                    primaryTypographyProps={{ style: { whiteSpace: 'pre-line' } }}
                  />
                </ListItem>
              </List>
              
              {request.notes && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Additional Notes
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    {request.notes}
                  </Paper>
                </Box>
              )}
            </Box>
          </Grid>
          
          {/* Right Side - Requester & Supplier Info */}
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              backgroundColor: theme.palette.grey[50],
              borderLeft: { md: `1px solid ${theme.palette.divider}` },
              p: 3
            }}
          >
            {/* Requester Info */}
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                Requester Information
              </Typography>
              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={request.requester_name || 'N/A'}
                    secondary="Name"
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EmailIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={request.requester_email || 'N/A'}
                    secondary="Email"
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PhoneIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={request.requester_phone || 'N/A'}
                    secondary="Phone"
                  />
                </ListItem>
              </List>
            </Box>
            
            {/* Supplier Info */}
            {request.supplier_name && (
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  Supplier Information
                </Typography>
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PersonIcon color="action" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={request.supplier_name || 'N/A'}
                      secondary="Company Name"
                    />
                  </ListItem>
                  {request.supplier_contact && (
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PersonIcon color="action" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={request.supplier_contact}
                        secondary="Contact Person"
                      />
                    </ListItem>
                  )}
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PhoneIcon color="action" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={request.supplier_phone || 'N/A'}
                      secondary="Phone"
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <EmailIcon color="action" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={request.supplier_email || 'N/A'}
                      secondary="Email"
                    />
                  </ListItem>
                </List>
              </Box>
            )}
            
            {/* Images */}
            {request.images && request.images.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Attached Images
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                  {request.images.map((image) => (
                    <Tooltip key={image.id} title="Click to view full size">
                      <Box
                        component="img"
                        src={image.image_url}
                        alt={`Tire image ${image.id}`}
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            transition: 'transform 0.2s',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => window.open(image.image_url, '_blank')}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onClose} color="primary" variant="outlined">
          Close
        </Button>
        {request.order_number && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // Handle print or other actions
              window.print();
            }}
          >
            Print Details
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default VehicleRequestDetailsModal;
