import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  MenuItem,
  Divider,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import serviceRequestService from '../services/serviceRequest';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Snackbar, Alert } from '@mui/material';

const deviceTypes = [
  'Laptop',
  'Desktop',
  'Printer',
  'Mobile Phone',
  'Tablet',
  'Other',
];

const serviceTypes = [
  'Repair',
  'Maintenance',
  'Data Recovery',
  'Hardware Upgrade',
  'Software Installation',
  'Diagnostic',
];

export default function CustomerIntake() {
  const navigate = useNavigate();
  const { user } = useAuth();
const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    deviceType: deviceTypes[0],
    deviceModel: '',
    serialNumber: '',
    serviceType: serviceTypes[0],
    issueDescription: '',
    estimatedCost: '',
    expectedCompletion: '',
    priority: 'normal',
    additionalNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const [errors, setErrors] = React.useState({});
const [openSnackbar, setOpenSnackbar] = React.useState(false);
const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const validateForm = () => {
    const newErrors = {};
    
    // Validate form data structure
    if (!formData || typeof formData !== 'object') {
      newErrors.submit = 'Form data is invalid';
      return false;
    }

    // Field validation helper with type checking
    const validateField = (field, fieldName, options = {}) => {
      const value = formData[field];
      const { type = 'string', pattern, minLength = 1, min = 0 } = options;

      // Check if value exists
      if (value === undefined || value === null) {
        newErrors[field] = `${fieldName} is required`;
        return;
      }

      // Type validation
      if (typeof value !== type) {
        newErrors[field] = `${fieldName} must be a ${type}`;
        return;
      }

      // Number-specific validations
      if (type === 'number') {
        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(numValue)) {
          newErrors[field] = `${fieldName} must be a valid number`;
          return;
        }
        if (numValue < min) {
          newErrors[field] = `${fieldName} must be at least ${min}`;
          return;
        }
      }

      // String-specific validations
      if (type === 'string') {
        const trimmedValue = value.trim();
        
        // Length validation
        if (trimmedValue.length < minLength) {
          newErrors[field] = `${fieldName} is required`;
          return;
        }

        // Pattern validation if provided
        if (pattern && !pattern.test(trimmedValue)) {
          newErrors[field] = `${fieldName} format is invalid`;
          return;
        }
      }
    };

    // Validate required fields with specific rules
    validateField('firstName', 'First Name');
    validateField('lastName', 'Last Name');
    validateField('email', 'Email', {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    });
    validateField('phone', 'Phone number', {
      pattern: /^[\d\s-+()]+$/
    });
    validateField('deviceType', 'Device Type');
    validateField('deviceModel', 'Device Model');
    validateField('serialNumber', 'Serial Number');
    validateField('serviceType', 'Service Type');
    validateField('issueDescription', 'Issue Description', {
      minLength: 10
    });
    validateField('estimatedCost', 'Estimated Cost', {
      type: 'string',
      pattern: /^\d+(\.\d{1,2})?$/,
      min: 0
    });
    validateField('expectedCompletion', 'Expected Completion', {
      type: 'string',
      minLength: 1
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setOpenSnackbar(true);
      setSnackbarMessage('Please fill in all required fields correctly');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        setOpenSnackbar(true);
        setSnackbarMessage('Please login to create a service request');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!user._id) {
        setOpenSnackbar(true);
        setSnackbarMessage('Invalid user session. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await serviceRequestService.createServiceRequest({
        customerDetails: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact_number: formData.phone
        },
        deviceDetails: {
          device_type: formData.deviceType,
          device_model: formData.deviceModel,
          issue_description: formData.issueDescription,
          serial_number: formData.serialNumber,
          service_type: formData.serviceType
        },
        paymentDetails: {
          total_amount: parseFloat(formData.estimatedCost) || 0,
          payment_method: 'pending',
          payment_status: 'pending',
          advance_amount: 0
        },
        expected_completion: new Date(formData.expectedCompletion),
        service_status: 'pending_shop_assignment',
        status: 'pending'
      });
      console.log('Service request created:', response);
      navigate('/dashboard');
    } catch (error) {
      if (error.status === 401 || error.response?.status === 401) {
        setOpenSnackbar(true);
        setSnackbarMessage('Your session has expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 2000);
        return;
      }
      setOpenSnackbar(true);
      setSnackbarMessage(error.error?.message || 'Failed to create service request');
      console.error('Error creating service request:', error);
      setErrors({
  submit: error.response?.data?.message || error.message || 'Failed to create service request',
  ...(error.response?.data?.errors && { serverErrors: error.response.data.errors })
});
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              New Service Request
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create a new service request by filling out the form below.
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Customer Information
                </Typography>
                {errors.submit && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.submit}
                  </Alert>
                )}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      variant="outlined"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      variant="outlined"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      variant="outlined"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      variant="outlined"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Device Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Device Type"
                      name="deviceType"
                      value={formData.deviceType}
                      onChange={handleInputChange}
                      margin="normal"
                    >
                      {deviceTypes.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Brand/Model"
                      variant="outlined"
                      name="deviceModel"
                      value={formData.deviceModel}
                      onChange={handleInputChange}
                      error={!!errors.deviceModel}
                      helperText={errors.deviceModel}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Serial Number"
                      variant="outlined"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Service Type"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      error={!!errors.serviceType}
                      helperText={errors.serviceType}
                    >
                      {serviceTypes.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Issue Description"
                      multiline
                      rows={4}
                      variant="outlined"
                      name="issueDescription"
                      value={formData.issueDescription}
                      onChange={handleInputChange}
                      error={!!errors.issueDescription}
                      helperText={errors.issueDescription}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenSnackbar(false)}
            >
              <Alert severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Service Summary
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Estimated Cost"
                    variant="outlined"
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: '₹',
                      inputProps: { min: 0, step: 1 }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Expected Completion"
                    type="date"
                    name="expectedCompletion"
                    value={formData.expectedCompletion}
                    onChange={handleInputChange}
                    error={!!errors.expectedCompletion}
                    helperText={errors.expectedCompletion}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Priority"
                    select
                    variant="outlined"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Create Service Request
                  </Button>
                </Stack>
              </CardContent>
            </Card>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenSnackbar(false)}
            >
              <Alert severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
