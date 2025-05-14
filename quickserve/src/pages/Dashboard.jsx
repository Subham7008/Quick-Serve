import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Build,
  LocalShipping,
  MoreVert,
  Add,
  CheckCircle,
  Schedule,
  Warning,
} from '@mui/icons-material';
import CustomerMenu from '../components/CustomerMenu';
import EditCustomerDialog from '../components/EditCustomerDialog';
import DashboardLayout from '../components/DashboardLayout';
import customerService from '../services/customerService';
import { useNavigate } from 'react-router-dom';

// Add the updateCustomer method to customerService if it doesn't exist
if (!customerService.updateCustomer) {
  customerService.updateCustomer = async (customerId, customerData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await customerService.addCustomer({...customerData, _id: customerId});
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to update customer' };
      }
      throw error.response?.data || error.message;
    }
  };
}

// Add the deleteCustomer method to customerService if it doesn't exist
if (!customerService.deleteCustomer) {
  customerService.deleteCustomer = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Use the API endpoint for deleting customers
      const response = await customerService.addCustomer({_id: customerId, isDeleted: true});
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to delete customer' };
      }
      throw error.response?.data || error.message;
    }
  };
}

const stats = [
  {
    title: 'Total Revenue',
    value: '₹12,628',
    change: '+12.5%',
    icon: <TrendingUp />,
    color: 'primary.main',
  },
  {
    title: 'Active Customers',
    value: '856',
    change: '+3.2%',
    icon: <People />,
    color: 'info.main',
  },
  {
    title: 'Pending Services',
    value: '42',
    change: '-8.4%',
    icon: <Build />,
    color: 'warning.main',
  },
  {
    title: 'Deliveries Today',
    value: '15',
    change: '+4.8%',
    icon: <LocalShipping />,
    color: 'success.main',
  },
];

const recentServices = [
  {
    id: 1,
    customer: 'John Doe',
    device: 'MacBook Pro',
    service: 'Battery Replacement',
    status: 'Completed',
    avatar: 'J',
  },
  {
    id: 2,
    customer: 'Alice Smith',
    device: 'iPhone 13',
    service: 'Screen Repair',
    status: 'In Progress',
    avatar: 'A',
  },
  {
    id: 3,
    customer: 'Bob Wilson',
    device: 'HP Printer',
    service: 'Maintenance',
    status: 'Pending',
    avatar: 'B',
  },
  {
    id: 4,
    customer: 'Emma Davis',
    device: 'Samsung S21',
    service: 'Data Recovery',
    status: 'Completed',
    avatar: 'E',
  },
];

const serviceStatus = {
  completed: { color: 'success', icon: <CheckCircle fontSize="small" /> },
  active: { color: 'primary', icon: <Schedule fontSize="small" /> },
  pending: { color: 'warning', icon: <Warning fontSize="small" /> },
  default: { color: 'default', icon: <Warning fontSize="small" /> }
};

// Add a helper function to capitalize the first letter of the status
const capitalizeFirstLetter = (string) => {
  if (!string) return 'Pending';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers();
      // Sort customers by newest first (assuming they have a createdAt field)
      // If there's no createdAt field, you may need to adjust this sorting logic
      const sortedCustomers = response.data ? [...response.data].sort((a, b) => {
        // If createdAt exists, use it for sorting
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // Fallback to _id (MongoDB IDs contain creation timestamp)
        return b._id.localeCompare(a._id);
      }) : [];
      
      setCustomers(sortedCustomers || []);
      
      // Apply status filter if one is active
      if (statusFilter) {
        setFilteredCustomers(sortedCustomers.filter(c => c.status === statusFilter));
      } else {
        setFilteredCustomers(sortedCustomers);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const handleStatusFilterChange = (status) => {
    // Toggle the filter off if clicking the same status
    if (status === statusFilter) {
      setStatusFilter(null);
    } else {
      setStatusFilter(status);
    }
  };

  const handleNewService = () => {
    navigate('/customer-intake');
  };
  
  const handleEditCustomer = (customer) => {
    // Ensure estimate_cost is properly set
    const customerToEdit = {...customer};
    
    // Make sure payment details exist
    if (!customerToEdit.paymentDetails) {
      customerToEdit.paymentDetails = {
        advance_amount: 0,
        total_amount: 0,
        estimate_cost: 0,
        payment_method: 'pending',
        payment_status: 'pending'
      };
    } 
    // Ensure estimate_cost is set properly
    else if (customerToEdit.paymentDetails.estimate_cost === undefined || 
             customerToEdit.paymentDetails.estimate_cost === null) {
      customerToEdit.paymentDetails.estimate_cost = customerToEdit.paymentDetails.total_amount || 0;
    }
    
    setSelectedCustomer(customerToEdit);
    setEditDialogOpen(true);
  };
  
  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      // Ensure all nested properties are included
      const customerToUpdate = {
        ...updatedCustomer,
        deviceDetails: {
          ...(updatedCustomer.deviceDetails || {}),
        },
        paymentDetails: {
          ...(updatedCustomer.paymentDetails || {}),
        }
      };
      
      // Make sure estimate_cost is properly set
      if (customerToUpdate.paymentDetails) {
        customerToUpdate.paymentDetails.estimate_cost = 
          parseFloat(customerToUpdate.paymentDetails.estimate_cost) || 
          parseFloat(customerToUpdate.paymentDetails.total_amount) || 0;
      }
      
      console.log("Updating customer with data:", customerToUpdate);
      
      await customerService.updateCustomer(customerToUpdate._id, customerToUpdate);
      
      // Refresh the customer list to ensure we have the latest data
      await fetchCustomers();
      
      return true;
    } catch (error) {
      console.error('Failed to update customer:', error);
      return false;
    }
  };
  
  const handleDeleteCustomer = async (customerId) => {
    try {
      await customerService.deleteCustomer(customerId);
      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  if (loading && customers.length === 0) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ mb: 4 }}>
          <Typography color="error" variant="h6">
            Error loading dashboard data: {error}
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: 'Total Customers',
      value: customers.length,
      change: '+' + Math.round((customers.length / 100) * 10) + '%',
      icon: <People />,
      color: 'info.main',
      status: null // No filter for this
    },
    {
      title: 'Active Services',
      value: customers.filter(c => c.status === 'active').length || '0',
      change: '+3.2%',
      icon: <Build />,
      color: 'warning.main',
      status: 'active'
    },
    {
      title: 'Completed Services',
      value: customers.filter(c => c.status === 'completed').length || '0',
      change: '+4.8%',
      icon: <CheckCircle />,
      color: 'success.main',
      status: 'completed'
    },
    {
      title: 'Pending Services',
      value: customers.filter(c => c.status === 'pending').length || '0',
      change: '-2.3%',
      icon: <Schedule />,
      color: 'error.main',
      status: 'pending'
    },
  ];

  // Determine what customers to display 
  const displayCustomers = statusFilter ? 
    customers.filter(c => c.status === statusFilter) : 
    customers;

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your service center today.
            {statusFilter && (
              <Box component="span" sx={{ ml: 1, fontWeight: 'bold' }}>
                Filtering by {capitalizeFirstLetter(statusFilter)} Status
              </Box>
            )}
          </Typography>
          {statusFilter && (
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setStatusFilter(null)}
              sx={{ mt: 1 }}
            >
              Clear Filter
            </Button>
          )}
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                    cursor: 'pointer',
                  },
                  // Highlight the active filter
                  border: statusFilter === stat.status ? 2 : 0,
                  borderColor: statusFilter === stat.status ? stat.color : 'transparent',
                }}
                onClick={() => {
                  if (stat.title === 'Total Customers') {
                    navigate('/customers');
                  } else if (stat.status) {
                    handleStatusFilterChange(stat.status);
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {stat.title}
                  </Typography>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  color={stat.change.startsWith('+') ? 'success.main' : 'error.main'}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {stat.change}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Services */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    {statusFilter ? `${capitalizeFirstLetter(statusFilter)} Services` : 'Recent Services'}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{ textTransform: 'none' }}
                    onClick={handleNewService}
                  >
                    New Service
                  </Button>
                </Stack>

                {loading && customers.length > 0 && (
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress />
                  </Box>
                )}

                <Stack spacing={2}>
                  {displayCustomers.length > 0 ? (
                    // Show filtered customers or up to 5 most recent
                    displayCustomers.slice(0, statusFilter ? displayCustomers.length : 5).map((customer) => (
                      <Box key={customer._id}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          sx={{ py: 1 }}
                        >
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {customer.name ? customer.name.charAt(0) : '?'}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2">
                              {customer.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {customer.email} - {customer.contact_number}
                            </Typography>
                          </Box>
                          <Chip
                            icon={(serviceStatus[customer.status?.toLowerCase()] || serviceStatus.default).icon}
                            label={capitalizeFirstLetter(customer.status)}
                            color={(serviceStatus[customer.status?.toLowerCase()] || serviceStatus.default).color}
                            size="small"
                          />
                          <CustomerMenu 
                            customer={customer} 
                            onEdit={handleEditCustomer} 
                            onDelete={handleDeleteCustomer}
                          />
                        </Stack>
                        <Divider sx={{ mt: 2 }} />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      {statusFilter ? 
                        `No customers with ${capitalizeFirstLetter(statusFilter)} status found.` : 
                        'No customers available yet. Click "New Service" to add your first customer.'}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Service Overview
                </Typography>

                {/* Calculate total customers for percentage calculations */}
                {(() => {
                  const totalCustomers = customers.length;
                  const completedCount = customers.filter(c => c.status === 'completed').length;
                  const activeCount = customers.filter(c => c.status === 'active').length;
                  const pendingCount = customers.filter(c => c.status === 'pending').length;
                  
                  // Calculate percentages - handle edge case of no customers
                  const completedPercentage = totalCustomers ? Math.round((completedCount / totalCustomers) * 100) : 0;
                  const activePercentage = totalCustomers ? Math.round((activeCount / totalCustomers) * 100) : 0;
                  const pendingPercentage = totalCustomers ? Math.round((pendingCount / totalCustomers) * 100) : 0;
                  
                  return (
                    <Stack spacing={3}>
                      <Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="body2">Completed</Typography>
                          <Typography variant="body2" color="success.main">
                            {completedPercentage}% ({completedCount})
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={completedPercentage}
                          color="success"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      <Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="body2">In Progress</Typography>
                          <Typography variant="body2" color="primary.main">
                            {activePercentage}% ({activeCount})
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={activePercentage}
                          color="primary"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      <Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="body2">Pending</Typography>
                          <Typography variant="body2" color="warning.main">
                            {pendingPercentage}% ({pendingCount})
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={pendingPercentage}
                          color="warning"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      
                      {totalCustomers === 0 && (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                          No service data available yet
                        </Typography>
                      )}
                    </Stack>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Edit Customer Dialog */}
      {selectedCustomer && (
        <EditCustomerDialog
          open={editDialogOpen}
          customer={selectedCustomer}
          onClose={() => setEditDialogOpen(false)}
          onUpdate={handleUpdateCustomer}
        />
      )}
    </DashboardLayout>
  );
}