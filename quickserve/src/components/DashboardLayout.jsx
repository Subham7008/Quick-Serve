import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';

import ErrorBoundary from './ErrorBoundary';

export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Spacer for fixed navbar */}
        {children}
      </Box>
    </Box>
    </ErrorBoundary>
  );
}