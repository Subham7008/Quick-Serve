import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import { ArrowBack, Save, Download } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import serviceRequestService from '../services/serviceRequest.service';
import { jsPDF } from 'jspdf';

const EditServiceRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Log the ID from URL params for debugging
  console.log('EditServiceRequest - ID from URL params:', id);
  const [serviceRequest, setServiceRequest] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  useEffect(() => {
    const fetchServiceRequest = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch service request with ID:', id);
        
        if (!id) {
          throw { 
            status: 400, 
            message: 'Invalid service request ID', 
            details: 'The service request ID is missing or invalid.',
            suggestion: 'Please return to the dashboard and try again.'
          };
        }
        
        const response = await serviceRequestService.getServiceRequestById(id);
        console.log('Service request data received:', response);
        
        if (!response.data) {
          throw { 
            status: 404, 
            message: 'Service request data is empty', 
            details: 'The server returned an empty response for this service request.',
            suggestion: 'Please verify the service request exists and try again.'
          };
        }
        
        setServiceRequest(response.data);
        setStatus(response.data.status || 'pending');
      } catch (err) {
        console.error('Error fetching service request:', err);
        // Handle 404 errors specifically with improved user experience
        if (err.status === 404) {
          setError({
            message: err.message || `Service request with ID ${id} not found`,
            details: err.details || 'It may have been deleted or never existed.',
            suggestion: err.suggestion || 'Verify the ID or check the service requests list'
          });
        } else {
          setError({
            message: err.message || 'Failed to fetch service request',
            details: err.details || 'An unexpected error occurred while fetching service request details',
            suggestion: err.suggestion || 'Please check your network connection and try again'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequest();
  }, [id]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await serviceRequestService.updateServiceStatus(id, status);
      setSuccess('Service request status updated successfully');
      
      // If status is completed, generate invoice
      if (status === 'completed') {
        setInvoiceGenerated(true);
      }
    } catch (err) {
      setError({
        message: err.message || 'Failed to update service request',
        details: 'Error occurred while saving status changes',
        suggestion: 'Verify your network connection and try again'
      });
      console.error('Error updating service request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const generateInvoice = () => {
    if (!serviceRequest) return;

    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Quick Serve', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Service Invoice', 105, 30, { align: 'center' });
    
    // Add line
    doc.line(20, 35, 190, 35);
    
    // Invoice details
    doc.setFontSize(10);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Invoice #: INV-${id.substring(0, 8)}`, 20, 52);
    
    // Customer details
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${serviceRequest.customerDetails.name}`, 20, 72);
    doc.text(`Email: ${serviceRequest.customerDetails.email}`, 20, 79);
    doc.text(`Contact: ${serviceRequest.customerDetails.contact_number}`, 20, 86);
    
    // Device details
    doc.setFont('helvetica', 'bold');
    doc.text('Device Details:', 120, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Type: ${serviceRequest.deviceDetails.device_type}`, 120, 72);
    doc.text(`Model: ${serviceRequest.deviceDetails.device_model}`, 120, 79);
    
    // Service details
    doc.setFont('helvetica', 'bold');
    doc.text('Service Details:', 20, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue: ${serviceRequest.deviceDetails.issue_description}`, 20, 107);
    doc.text(`Status: Completed`, 20, 114);
    
    // Payment details
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', 20, 130);
    doc.setFont('helvetica', 'normal');
    
    // Table header
    doc.line(20, 137, 190, 137);
    doc.text('Description', 22, 143);
    doc.text('Amount', 170, 143, { align: 'right' });
    doc.line(20, 145, 190, 145);
    
    // Table content
    doc.text('Service Charge', 22, 152);
    doc.text(`₹${serviceRequest.paymentDetails.total_amount.toFixed(2)}`, 170, 152, { align: 'right' });
    
    if (serviceRequest.paymentDetails.advance_amount > 0) {
      doc.text('Advance Payment', 22, 159);
      doc.text(`-₹${serviceRequest.paymentDetails.advance_amount.toFixed(2)}`, 170, 159, { align: 'right' });
    }
    
    // Total
    doc.line(20, 165, 190, 165);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Due', 22, 172);
    const totalDue = serviceRequest.paymentDetails.total_amount - serviceRequest.paymentDetails.advance_amount;
    doc.text(`₹${totalDue.toFixed(2)}`, 170, 172, { align: 'right' });
    
    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for choosing Quick Serve for your device repair needs!', 105, 200, { align: 'center' });
    doc.text('For any questions regarding this invoice, please contact support@quickserve.com', 105, 205, { align: 'center' });
    
    // Save the PDF
    const fileName = `invoice-${id.substring(0, 8)}.pdf`;
    doc.save(fileName);
  };

  if (loading && !serviceRequest) {
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Service Request Not Found
            </Typography>
            <Typography variant="body1" paragraph>
              {error.message}
            </Typography>
            {error.details && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {error.details}
              </Typography>
            )}
            {error.suggestion && (
              <Typography variant="body2" paragraph>
                {error.suggestion}
              </Typography>
            )}
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{ mt: 2 }}
            >
              Return to Dashboard
            </Button>
          </Paper>
        ) : (
          <>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              Edit Service Request
            </Typography>
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {serviceRequest && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Service Request Details
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Customer</Typography>
                      <Typography variant="body2">{serviceRequest.customerDetails?.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Contact</Typography>
                      <Typography variant="body2">{serviceRequest.customerDetails?.contact_number}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Device</Typography>
                      <Typography variant="body2">{serviceRequest.deviceDetails?.device_type} - {serviceRequest.deviceDetails?.device_model}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Issue</Typography>
                      <Typography variant="body2">{serviceRequest.deviceDetails?.issue_description}</Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Update Status
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={status}
                      label="Status"
                      onChange={handleStatusChange}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                {serviceRequest?.paymentDetails && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Payment Information
                    </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Total Amount</Typography>
                  <Typography variant="h5">₹{serviceRequest.paymentDetails.total_amount.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Advance Payment</Typography>
                  <Typography variant="body1">₹{serviceRequest.paymentDetails.advance_amount.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2">Balance Due</Typography>
                  <Typography variant="h6" color="error">
                    ₹{(serviceRequest.paymentDetails.total_amount - serviceRequest.paymentDetails.advance_amount).toFixed(2)}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {(status === 'completed' || invoiceGenerated) && (
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<Download />}
                    onClick={generateInvoice}
                  >
                    Download Invoice
                  </Button>
                )}
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
            </>
          )}
      </Container>
    </DashboardLayout>
  );
};

export default EditServiceRequest;