import React, { useState } from 'react';
import { Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, Typography } from '@mui/material';
import { MoreVert, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import serviceRequestService from '../services/serviceRequest.service';

const ServiceRequestMenu = ({ serviceRequest, onStatusChange, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    // Make sure we're using the correct route path that matches App.jsx
    if (serviceRequest && serviceRequest._id) {
      console.log(`Navigating to service request with ID: ${serviceRequest._id}`);
      navigate(`/service-request/edit/${serviceRequest._id}`);
    } else {
      console.error('Service request ID is missing or invalid:', serviceRequest);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await serviceRequestService.deleteServiceRequest(serviceRequest._id);
      setConfirmDeleteOpen(false);
      if (onDelete) {
        onDelete(serviceRequest._id);
      }
    } catch (error) {
      console.error('Error deleting service request:', error);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
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
        <MenuItem onClick={handleEditClick}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Remove
        </MenuItem>
      </Menu>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this service request? This action cannot be undone.
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

export default ServiceRequestMenu;