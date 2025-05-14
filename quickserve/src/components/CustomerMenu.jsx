import React, { useState } from 'react';
import { 
  Menu, 
  MenuItem, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Divider,
  Grid,
  Paper,
  Box
} from '@mui/material';
import { MoreVert, Edit, Delete, Receipt, DoNotDisturb, Visibility } from '@mui/icons-material';
import { jsPDF } from 'jspdf';

const CustomerMenu = ({ customer, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    if (onEdit && customer) {
      onEdit(customer);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDeleteOpen(true);
  };

  const handleViewDetailsClick = () => {
    handleMenuClose();
    setViewDetailsOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    if (onDelete && customer) {
      onDelete(customer._id);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
  };
  
  const handleGenerateInvoice = () => {
    handleMenuClose();
    
    if (!customer?.deviceDetails || !customer?.paymentDetails?.total_amount) {
      alert('Cannot generate invoice: Missing device or payment details');
      return;
    }
    
    generateInvoice();
  };
  
  const generateInvoice = () => {
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
    doc.text(`Invoice #: INV-${customer._id.substring(0, 8)}`, 20, 52);
    
    // Customer details
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${customer.name}`, 20, 72);
    doc.text(`Email: ${customer.email}`, 20, 79);
    doc.text(`Contact: ${customer.contact_number}`, 20, 86);
    
    // Device details
    doc.setFont('helvetica', 'bold');
    doc.text('Device Details:', 120, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Type: ${customer.deviceDetails?.device_type || 'N/A'}`, 120, 72);
    doc.text(`Model: ${customer.deviceDetails?.device_model || 'N/A'}`, 120, 79);
    doc.text(`Serial Number: ${customer.deviceDetails?.serial_number || 'N/A'}`, 120, 86);
    doc.text(`Service Type: ${customer.deviceDetails?.service_type || 'N/A'}`, 120, 93);
    
    // Service details
    doc.setFont('helvetica', 'bold');
    doc.text('Service Details:', 20, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue: ${customer.deviceDetails?.issue_description || 'N/A'}`, 20, 107);
    doc.text(`Status: ${customer.status ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1) : 'Pending'}`, 20, 114);
    
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
    if (customer.paymentDetails?.estimate_cost > 0) {
      doc.text('Estimated Cost', 22, 152);
      const estimateCost = parseFloat(customer.paymentDetails.estimate_cost) || 0;
      doc.text(`RS. ${estimateCost.toFixed(2)}`, 170, 152, { align: 'right' });
      
      doc.text('Service Charge', 22, 159);
      const totalAmount = parseFloat(customer.paymentDetails?.total_amount) || 0;
      doc.text(`RS. ${totalAmount.toFixed(2)}`, 170, 159, { align: 'right' });
      
      if (customer.paymentDetails?.advance_amount > 0) {
        doc.text('Advance Payment', 22, 166);
        const advanceAmount = parseFloat(customer.paymentDetails.advance_amount) || 0;
        doc.text(`-RS. ${advanceAmount.toFixed(2)}`, 170, 166, { align: 'right' });
      }
      
      // Total
      doc.line(20, 173, 190, 173);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Due', 22, 180);
      const totalDue = totalAmount - (parseFloat(customer.paymentDetails?.advance_amount) || 0);
      doc.text(`RS. ${totalDue.toFixed(2)}`, 170, 180, { align: 'right' });
    } else {
      // Original table without estimate cost
      doc.text('Service Charge', 22, 152);
      const totalAmount = parseFloat(customer.paymentDetails?.total_amount) || 0;
      doc.text(`RS. ${totalAmount.toFixed(2)}`, 170, 152, { align: 'right' });
      
      if (customer.paymentDetails?.advance_amount > 0) {
        doc.text('Advance Payment', 22, 159);
        const advanceAmount = parseFloat(customer.paymentDetails.advance_amount) || 0;
        doc.text(`-RS. ${advanceAmount.toFixed(2)}`, 170, 159, { align: 'right' });
      }
      
      // Total
      doc.line(20, 165, 190, 165);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Due', 22, 172);
      const totalDue = totalAmount - (parseFloat(customer.paymentDetails?.advance_amount) || 0);
      doc.text(`RS. ${totalDue.toFixed(2)}`, 170, 172, { align: 'right' });
    }
    
    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for choosing Quick Serve for your device repair needs!', 105, 200, { align: 'center' });
    doc.text('For any questions regarding this invoice, please contact support@quickserve.com', 105, 205, { align: 'center' });
    
    // Save the PDF - Use output method for direct download
    const fileName = `invoice-${customer._id.substring(0, 8)}.pdf`;
    doc.save(fileName);
  };

  const canGenerateInvoice = Boolean(customer?.deviceDetails) && 
    Boolean(customer?.paymentDetails?.total_amount);

  // Helper function to capitalize first letter of status
  const capitalizeFirstLetter = (string) => {
    if (!string) return 'Pending';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <>
      <IconButton size="small" onClick={handleMenuOpen}>
        <MoreVert fontSize="small" />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetailsClick}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        <MenuItem onClick={handleEditClick}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        
        {canGenerateInvoice ? (
          <MenuItem onClick={handleGenerateInvoice}>
            <Receipt fontSize="small" sx={{ mr: 1 }} />
            Generate Invoice
          </MenuItem>
        ) : (
          <MenuItem disabled>
            <DoNotDisturb fontSize="small" sx={{ mr: 1 }} />
            Invoice Unavailable
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Remove
        </MenuItem>
      </Menu>

      {/* View Customer Details Dialog */}
      <Dialog 
        open={viewDetailsOpen} 
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Customer Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Customer Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Name:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{customer?.name || 'N/A'}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{customer?.email || 'N/A'}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Contact:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{customer?.contact_number || 'N/A'}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{capitalizeFirstLetter(customer?.status)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Device Details */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Device Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Device Type:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{customer?.deviceDetails?.device_type || 'N/A'}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Model:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{customer?.deviceDetails?.device_model || 'N/A'}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Serial Number:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{customer?.deviceDetails?.serial_number || 'N/A'}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Service Type:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{customer?.deviceDetails?.service_type || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Service Issue */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Service Issue
                </Typography>
                <Typography variant="body2">
                  {customer?.deviceDetails?.issue_description || 'No issue description provided.'}
                </Typography>
              </Paper>
            </Grid>
            
            {/* Payment Details */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Payment Details
                </Typography>
                <Grid container spacing={2}>
                  {customer?.paymentDetails?.estimate_cost > 0 && (
                    <>
                      <Grid item xs={4} sm={3}>
                        <Typography variant="body2" color="text.secondary">Estimated Cost:</Typography>
                      </Grid>
                      <Grid item xs={8} sm={3}>
                        <Typography variant="body2">RS. {parseFloat(customer?.paymentDetails?.estimate_cost || 0).toFixed(2)}</Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <Typography variant="body2">RS. {parseFloat(customer?.paymentDetails?.total_amount || 0).toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">Advance Paid:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <Typography variant="body2">RS. {parseFloat(customer?.paymentDetails?.advance_amount || 0).toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">Balance Due:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <Typography variant="body2" fontWeight="bold">
                      RS. {(parseFloat(customer?.paymentDetails?.total_amount || 0) - parseFloat(customer?.paymentDetails?.advance_amount || 0)).toFixed(2)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <Typography variant="body2">{capitalizeFirstLetter(customer?.paymentDetails?.payment_method)}</Typography>
                  </Grid>
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <Typography variant="body2">{capitalizeFirstLetter(customer?.paymentDetails?.payment_status)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          {canGenerateInvoice && (
            <Button 
              onClick={() => {
                setViewDetailsOpen(false);
                generateInvoice();
              }}
              color="primary"
              startIcon={<Receipt />}
            >
              Generate Invoice
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the customer <strong>{customer?.name}</strong>? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Note: Deleting this customer will also remove all associated service requests and device records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomerMenu; 