import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Search,
  ArrowBack,
  Add,
  Refresh,
  Phone,
  Email,
  Devices,
  AssignmentLate,
  CheckCircle,
  HourglassEmpty,
  Engineering,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import CustomerMenu from '../components/CustomerMenu';
import customerService from '../services/customer.service';
import EditCustomerDialog from '../components/EditCustomerDialog';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      filterCustomers();
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers();
      setCustomers(response.data || []);
      setFilteredCustomers(response.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(
      customer => 
        customer.name?.toLowerCase().includes(term) || 
        customer.email?.toLowerCase().includes(term) || 
        customer.contact_number?.includes(term) ||
        customer.deviceDetails?.device_type?.toLowerCase().includes(term) ||
        customer.deviceDetails?.device_model?.toLowerCase().includes(term) ||
        customer.status?.toLowerCase().includes(term)
    );
    
    setFilteredCustomers(filtered);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddCustomer = () => {
    navigate('/customer-intake');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleEditCustomer = async (customer) => {
    try {
      console.log("Original customer data:", customer);
      
      // Attempt to fetch device details if not already present
      if (!customer.deviceDetails) {
        try {
          const deviceResponse = await customerService.getDevices(customer._id);
          if (deviceResponse.data && deviceResponse.data.length > 0) {
            const device = deviceResponse.data[0]; // Get the first device
            customer.deviceDetails = {
              device_type: device.device_type,
              device_model: device.device_model,
              issue_description: device.issue_description,
              serial_number: device.serial_number || '',
              service_type: device.service_type || ''
            };
            customer.status = device.status === 'Completed' ? 'completed' : 
                             device.status === 'In Progress' ? 'active' : 'pending';
          }
        } catch (error) {
          console.warn("Could not fetch device details:", error);
        }
      }
      
      // Try to get payment details if not present
      if (!customer.paymentDetails || !customer.paymentDetails.estimate_cost) {
        try {
          // Fetch associated payments
          const paymentsUrl = `${import.meta.env.VITE_API_URL}/api/payments/customer/${customer._id}`;
          console.log("Fetching payments from:", paymentsUrl);
          
          const paymentsResponse = await fetch(paymentsUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json();
            console.log("Payments data received:", paymentsData);
            
            if (paymentsData.data && paymentsData.data.length > 0) {
              const payment = paymentsData.data[0]; // Get the first payment
              customer.paymentDetails = {
                advance_amount: payment.advance_amount || 0,
                total_amount: payment.total_amount || 0,
                estimate_cost: (payment.estimate_cost && payment.estimate_cost !== 0) 
                  ? payment.estimate_cost 
                  : payment.total_amount || 0,
                payment_method: payment.payment_method?.toLowerCase() || 'pending',
                payment_status: payment.payment_status?.toLowerCase() || 'pending'
              };
              console.log("Enhanced customer with payment data:", customer.paymentDetails);
            } else {
              // Create empty payment details if none exist
              customer.paymentDetails = {
                advance_amount: 0,
                total_amount: 0,
                estimate_cost: 0,
                payment_method: 'pending',
                payment_status: 'pending'
              };
            }
          } else {
            console.warn("Payment fetch failed with status:", paymentsResponse.status);
            const errorText = await paymentsResponse.text();
            console.warn("Payment fetch error text:", errorText);
          }
        } catch (error) {
          console.warn("Could not fetch payment details:", error);
          // Provide default payment details if fetch fails
          if (!customer.paymentDetails) {
            customer.paymentDetails = {
              advance_amount: 0,
              total_amount: 0,
              estimate_cost: 0,
              payment_method: 'pending',
              payment_status: 'pending'
            };
          } else if (!customer.paymentDetails.estimate_cost) {
            // If paymentDetails exists but estimate_cost is missing, set it as the total_amount
            customer.paymentDetails.estimate_cost = customer.paymentDetails.total_amount || 0;
          }
        }
      } else if (!customer.paymentDetails.estimate_cost) {
        // If paymentDetails exists but estimate_cost is missing, set it as the total_amount
        customer.paymentDetails.estimate_cost = customer.paymentDetails.total_amount || 0;
      }
      
      // Add detailed logging for device details
      console.log("Device Details Data:", {
        device_type: customer.deviceDetails?.device_type,
        device_model: customer.deviceDetails?.device_model,
        issue_description: customer.deviceDetails?.issue_description,
        serial_number: customer.deviceDetails?.serial_number,
        service_type: customer.deviceDetails?.service_type,
        hasSerialNumber: !!customer.deviceDetails?.serial_number,
        hasServiceType: !!customer.deviceDetails?.service_type
      });
      
      console.log("Enhanced customer data for edit:", customer);
      setSelectedCustomer(customer);
      setIsEditDialogOpen(true);
    } catch (err) {
      console.error("Error preparing customer data for edit:", err);
      setSnackbar({
        open: true,
        message: "Error loading customer details for editing",
        severity: "error"
      });
    }
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      await customerService.updateCustomer(updatedCustomer._id, updatedCustomer);
      
      // Update local state with the updated customer
      setCustomers(prevCustomers => 
        prevCustomers.map(c => c._id === updatedCustomer._id ? updatedCustomer : c)
      );
      
      setSnackbar({
        open: true,
        message: 'Customer updated successfully',
        severity: 'success'
      });
      
      handleCloseEditDialog();
    } catch (err) {
      console.error('Error updating customer:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update customer',
        severity: 'error'
      });
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await customerService.deleteCustomer(customerId);
      
      // Remove customer from local state
      setCustomers(prevCustomers => 
        prevCustomers.filter(c => c._id !== customerId)
      );
      
      setSnackbar({
        open: true,
        message: 'Customer deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting customer:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete customer',
        severity: 'error'
      });
    }
  };

  const handleRefresh = () => {
    fetchCustomers();
    setSnackbar({
      open: true,
      message: 'Customer list refreshed',
      severity: 'info'
    });
  };

  const getStatusChip = (status) => {
    if (!status) return <Chip size="small" label="Pending" color="default" />;
    
    switch(status.toLowerCase()) {
      case 'active':
        return <Chip 
          size="small" 
          label="Active" 
          color="primary" 
          icon={<Engineering fontSize="small" />}
        />;
      case 'completed':
        return <Chip 
          size="small" 
          label="Completed" 
          color="success" 
          icon={<CheckCircle fontSize="small" />}
        />;
      case 'pending':
      default:
        return <Chip 
          size="small" 
          label="Pending" 
          color="warning" 
          icon={<HourglassEmpty fontSize="small" />}
        />;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && !customers.length) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Box mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight={700}>
              Customer Management
            </Typography>
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddCustomer}
              >
                Add Customer
              </Button>
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" flexWrap="wrap">
                    <Typography variant="h6" mr={2}>
                      Total Customers: {customers.length}
                    </Typography>
                    <Chip 
                      label={`Active: ${customers.filter(c => c.status === 'active').length}`} 
                      color="primary" 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`Completed: ${customers.filter(c => c.status === 'completed').length}`} 
                      color="success" 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`Pending: ${customers.filter(c => !c.status || c.status === 'pending').length}`} 
                      color="warning" 
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search by name, email, contact, device or status..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {filteredCustomers.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No customers found matching your search criteria.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="25%">Customer</TableCell>
                    <TableCell width="25%">Contact Information</TableCell>
                    <TableCell width="35%">Device & Service Details</TableCell>
                    <TableCell width="10%">Status</TableCell>
                    <TableCell align="center" width="5%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {customer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {customer._id?.substring(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">{customer.email}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">{customer.contact_number}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {customer.deviceDetails ? (
                          <>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Devices fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                <strong>{customer.deviceDetails.device_type}</strong> - {customer.deviceDetails.device_model}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              <Tooltip title={customer.deviceDetails.issue_description}>
                                <span>{customer.deviceDetails.issue_description}</span>
                              </Tooltip>
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No device information available
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(customer.status)}
                        {customer.paymentDetails?.payment_status === 'completed' && (
                          <Chip 
                            size="small" 
                            label="Paid" 
                            color="success" 
                            sx={{ mt: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <CustomerMenu 
                          customer={customer} 
                          onEdit={handleEditCustomer} 
                          onDelete={handleDeleteCustomer}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Container>

      <EditCustomerDialog
        open={isEditDialogOpen}
        customer={selectedCustomer}
        onClose={handleCloseEditDialog}
        onUpdate={handleUpdateCustomer}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default CustomerList; 