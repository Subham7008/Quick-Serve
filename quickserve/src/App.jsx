import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { CssBaseline, GlobalStyles } from '@mui/material';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CustomerIntake from './pages/CustomerIntake';
import CustomerList from './pages/CustomerList';
import Profile from './pages/Profile';
import EditServiceRequest from './pages/EditServiceRequest';

const globalStyles = {
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  'html, body': {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    overflowX: 'hidden',
  },
  '#root': {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100vw',
    overflowX: 'hidden',
  },
};

export default function App() {
  return (
    <>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/customer-intake" element={<PrivateRoute><CustomerIntake /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><CustomerList /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        {/* This route handles editing service requests */}
        <Route path="/service-request/edit/:id" element={<PrivateRoute><EditServiceRequest /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}