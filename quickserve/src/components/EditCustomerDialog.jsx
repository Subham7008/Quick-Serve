import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Typography,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Person, DevicesOther, Payment, Download, Save } from '@mui/icons-material';
import { jsPDF } from 'jspdf';

const EditCustomerDialog = ({ open, customer, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    email: '',
    contact_number: '',
    status: 'pending',
    deviceDetails: {
      device_type: '',
      device_model: '',
      issue_description: '',
      serial_number: '',
      service_type: ''
    },
    paymentDetails: {
      advance_amount: 0,
      total_amount: 0,
      estimate_cost: 0,
      payment_method: 'pending',
      payment_status: 'pending'
    }
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      console.log("Customer data received in EditCustomerDialog:", customer);
      console.log("Raw device details:", customer.deviceDetails);
      
      // Ensure estimate_cost has a value, falling back to total_amount if needed
      let estimateCost = 0;
      if (customer.paymentDetails) {
        estimateCost = customer.paymentDetails.estimate_cost !== undefined && 
                      customer.paymentDetails.estimate_cost !== null && 
                      customer.paymentDetails.estimate_cost !== 0
          ? customer.paymentDetails.estimate_cost 
          : customer.paymentDetails.total_amount || 0;
        
        console.log("Using estimate cost:", estimateCost, 
                   "Original:", customer.paymentDetails.estimate_cost, 
                   "Total amount:", customer.paymentDetails.total_amount);
      }
      
      setFormData({
        _id: customer._id || '',
        name: customer.name || '',
        email: customer.email || '',
        contact_number: customer.contact_number || '',
        status: customer.status || 'pending',
        deviceDetails: {
          device_type: customer.deviceDetails?.device_type || '',
          device_model: customer.deviceDetails?.device_model || '',
          issue_description: customer.deviceDetails?.issue_description || '',
          serial_number: customer.deviceDetails?.serial_number || '',
          service_type: customer.deviceDetails?.service_type || ''
        },
        paymentDetails: {
          advance_amount: customer.paymentDetails?.advance_amount || 0,
          total_amount: customer.paymentDetails?.total_amount || 0,
          estimate_cost: estimateCost,
          payment_method: customer.paymentDetails?.payment_method || 'pending',
          payment_status: customer.paymentDetails?.payment_status || 'pending'
        }
      });
      
      // Log the form data after setting it
      console.log("Form data after setting:", {
        deviceDetails: {
          device_type: customer.deviceDetails?.device_type || '',
          device_model: customer.deviceDetails?.device_model || '',
          issue_description: customer.deviceDetails?.issue_description || '',
          serial_number: customer.deviceDetails?.serial_number || '',
          service_type: customer.deviceDetails?.service_type || ''
        }
      });
      
      // If device details exist, automatically navigate to the device tab
      if (customer.deviceDetails && customer.deviceDetails.device_type) {
        // Set a slight delay to ensure the dialog is fully rendered
        setTimeout(() => setTabValue(1), 100);
      }
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      
      // Special handling for estimate_cost to ensure it's a number
      if (field === 'estimate_cost') {
        const numValue = value === '' ? 0 : Number(value);
        console.log(`Setting ${field} to:`, numValue, "from original value:", value);
        
        setFormData({
          ...formData,
          [section]: {
            ...formData[section],
            [field]: numValue
          }
        });
        return;
      }
      
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate customer info
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    
    // Validate device details if provided
    if (tabValue === 1) {
      if (!formData.deviceDetails.device_type.trim()) 
        newErrors['deviceDetails.device_type'] = 'Device type is required';
      if (!formData.deviceDetails.device_model.trim()) 
        newErrors['deviceDetails.device_model'] = 'Device model is required';
      if (!formData.deviceDetails.issue_description.trim()) 
        newErrors['deviceDetails.issue_description'] = 'Issue description is required';
      if (!formData.deviceDetails.serial_number.trim())
        newErrors['deviceDetails.serial_number'] = 'Serial number is required';
      if (!formData.deviceDetails.service_type.trim())
        newErrors['deviceDetails.service_type'] = 'Service type is required';
    }
    
    // Validate payment details if total amount is provided
    if (tabValue === 2 && formData.paymentDetails.total_amount > 0) {
      if (formData.paymentDetails.payment_method === 'pending' && formData.status === 'completed') {
        newErrors['paymentDetails.payment_method'] = 'Completed services must have a payment method';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Create a deep copy to avoid reference issues
    const dataToSubmit = JSON.parse(JSON.stringify(formData));
    
    // Make sure estimate_cost is present and is a number
    if (dataToSubmit.paymentDetails) {
      dataToSubmit.paymentDetails.estimate_cost = 
        Number(dataToSubmit.paymentDetails.estimate_cost) || 
        Number(dataToSubmit.paymentDetails.total_amount) || 0;
    }
    
    // Add debug logs for serial_number and service_type
    console.log("Serial Number being submitted:", dataToSubmit.deviceDetails.serial_number);
    console.log("Service Type being submitted:", dataToSubmit.deviceDetails.service_type);
    console.log("Complete device details being submitted:", dataToSubmit.deviceDetails);
    
    console.log("Submitting form data:", dataToSubmit);
    
    setLoading(true);
    try {
      await onUpdate(dataToSubmit);
      onClose();
    } catch (error) {
      console.error('Failed to update customer:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const generateInvoice = () => {
    if (!formData.deviceDetails.device_type || !formData.paymentDetails.total_amount) {
      alert('Cannot generate invoice: Missing device or payment details');
      return;
    }
    
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
    doc.text(`Invoice #: INV-${formData._id.substring(0, 8)}`, 20, 52);
    
    // Customer details
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${formData.name}`, 20, 72);
    doc.text(`Email: ${formData.email}`, 20, 79);
    doc.text(`Contact: ${formData.contact_number}`, 20, 86);
    
    // Device details
    doc.setFont('helvetica', 'bold');
    doc.text('Device Details:', 120, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Type: ${formData.deviceDetails.device_type}`, 120, 72);
    doc.text(`Model: ${formData.deviceDetails.device_model}`, 120, 79);
    doc.text(`Serial Number: ${formData.deviceDetails.serial_number}`, 120, 86);
    doc.text(`Service Type: ${formData.deviceDetails.service_type}`, 120, 93);
    
    // Service details
    doc.setFont('helvetica', 'bold');
    doc.text('Service Details:', 20, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue: ${formData.deviceDetails.issue_description}`, 20, 107);
    doc.text(`Status: ${formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}`, 20, 114);
    
    // Payment details
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', 20, 130);
    doc.setFont('helvetica', 'normal');
    
    // Table header
    doc.line(20, 137, 190, 137);
    doc.text('Description', 22, 143);
    doc.text('Amount', 170, 143, { align: 'right' });
    doc.line(20, 145, 190, 145);
    
    // Table content - Add estimate cost
    if (parseFloat(formData.paymentDetails.estimate_cost) > 0) {
      doc.text('Estimated Cost', 22, 152);
      doc.text(`₹${parseFloat(formData.paymentDetails.estimate_cost).toFixed(2)}`, 170, 152, { align: 'right' });
      
      doc.text('Service Charge', 22, 159);
      doc.text(`₹${parseFloat(formData.paymentDetails.total_amount).toFixed(2)}`, 170, 159, { align: 'right' });
      
      if (parseFloat(formData.paymentDetails.advance_amount) > 0) {
        doc.text('Advance Payment', 22, 166);
        doc.text(`-₹${parseFloat(formData.paymentDetails.advance_amount).toFixed(2)}`, 170, 166, { align: 'right' });
      }
      
      // Total
      doc.line(20, 173, 190, 173);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Due', 22, 180);
      const totalDue = parseFloat(formData.paymentDetails.total_amount) - parseFloat(formData.paymentDetails.advance_amount);
      doc.text(`₹${totalDue.toFixed(2)}`, 170, 180, { align: 'right' });
    } else {
      // Original table without estimate cost
      doc.text('Service Charge', 22, 152);
      doc.text(`₹${parseFloat(formData.paymentDetails.total_amount).toFixed(2)}`, 170, 152, { align: 'right' });
      
      if (parseFloat(formData.paymentDetails.advance_amount) > 0) {
        doc.text('Advance Payment', 22, 159);
        doc.text(`-₹${parseFloat(formData.paymentDetails.advance_amount).toFixed(2)}`, 170, 159, { align: 'right' });
      }
      
      // Total
      doc.line(20, 165, 190, 165);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Due', 22, 172);
      const totalDue = parseFloat(formData.paymentDetails.total_amount) - parseFloat(formData.paymentDetails.advance_amount);
      doc.text(`₹${totalDue.toFixed(2)}`, 170, 172, { align: 'right' });
    }
    
    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for choosing Quick Serve for your device repair needs!', 105, 200, { align: 'center' });
    doc.text('For any questions regarding this invoice, please contact support@quickserve.com', 105, 205, { align: 'center' });
    
    // Save the PDF
    const fileName = `invoice-${formData._id.substring(0, 8)}.pdf`;
    doc.save(fileName);
  };

  const customerInfoTab = (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          name="name"
          label="Customer Name"
          fullWidth
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          margin="normal"
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          name="email"
          label="Email"
          type="email"
          fullWidth
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          margin="normal"
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          name="contact_number"
          label="Contact Number"
          fullWidth
          value={formData.contact_number}
          onChange={handleChange}
          error={!!errors.contact_number}
          helperText={errors.contact_number}
          margin="normal"
          required
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Service Status</InputLabel>
          <Select
            name="status"
            value={formData.status}
            label="Service Status"
            onChange={handleChange}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  const deviceDetailsTab = (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          name="deviceDetails.device_type"
          label="Device Type"
          fullWidth
          value={formData.deviceDetails.device_type}
          onChange={handleChange}
          error={!!errors['deviceDetails.device_type']}
          helperText={errors['deviceDetails.device_type']}
          margin="normal"
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          name="deviceDetails.device_model"
          label="Device Model"
          fullWidth
          value={formData.deviceDetails.device_model}
          onChange={handleChange}
          error={!!errors['deviceDetails.device_model']}
          helperText={errors['deviceDetails.device_model']}
          margin="normal"
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          name="deviceDetails.serial_number"
          label="Serial Number"
          fullWidth
          value={formData.deviceDetails.serial_number}
          onChange={handleChange}
          error={!!errors['deviceDetails.serial_number']}
          helperText={errors['deviceDetails.serial_number']}
          margin="normal"
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          name="deviceDetails.service_type"
          label="Service Type"
          fullWidth
          value={formData.deviceDetails.service_type}
          onChange={handleChange}
          error={!!errors['deviceDetails.service_type']}
          helperText={errors['deviceDetails.service_type']}
          margin="normal"
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          name="deviceDetails.issue_description"
          label="Issue Description"
          fullWidth
          multiline
          rows={4}
          value={formData.deviceDetails.issue_description}
          onChange={handleChange}
          error={!!errors['deviceDetails.issue_description']}
          helperText={errors['deviceDetails.issue_description']}
          margin="normal"
          required
        />
      </Grid>
    </Grid>
  );
  
  const paymentDetailsTab = (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          name="paymentDetails.estimate_cost"
          label="Estimate Cost"
          fullWidth
          value={formData.paymentDetails.estimate_cost}
          onChange={handleChange}
          error={!!errors['paymentDetails.estimate_cost']}
          helperText={errors['paymentDetails.estimate_cost']}
          margin="normal"
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          name="paymentDetails.advance_amount"
          label="Advance Amount"
          fullWidth
          value={formData.paymentDetails.advance_amount}
          onChange={handleChange}
          error={!!errors['paymentDetails.advance_amount']}
          helperText={errors['paymentDetails.advance_amount']}
          margin="normal"
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          name="paymentDetails.total_amount"
          label="Total Amount"
          fullWidth
          value={formData.paymentDetails.total_amount}
          onChange={handleChange}
          error={!!errors['paymentDetails.total_amount']}
          helperText={errors['paymentDetails.total_amount']}
          margin="normal"
          required
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Payment Method</InputLabel>
          <Select
            name="paymentDetails.payment_method"
            value={formData.paymentDetails.payment_method}
            label="Payment Method"
            onChange={handleChange}
            error={!!errors['paymentDetails.payment_method']}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="upi">UPI</MenuItem>
          </Select>
          {errors['paymentDetails.payment_method'] && (
            <Typography color="error" variant="caption">
              {errors['paymentDetails.payment_method']}
            </Typography>
          )}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Payment Status</InputLabel>
          <Select
            name="paymentDetails.payment_status"
            value={formData.paymentDetails.payment_status}
            label="Payment Status"
            onChange={handleChange}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Download />}
          onClick={generateInvoice}
          disabled={!formData.deviceDetails.device_type || 
                  !formData.paymentDetails.total_amount}
          sx={{ mt: 1 }}
        >
          Generate Invoice
        </Button>
      </Grid>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Customer
      </DialogTitle>
      
      <DialogContent>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Person />} label="Customer Info" />
          <Tab icon={<DevicesOther />} label="Device Details" />
          <Tab icon={<Payment />} label="Payment" />
        </Tabs>
        
        <Box sx={{ p: 1 }}>
          {tabValue === 0 && customerInfoTab}
          {tabValue === 1 && deviceDetailsTab}
          {tabValue === 2 && paymentDetailsTab}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={24} /> : <Save />}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCustomerDialog; 