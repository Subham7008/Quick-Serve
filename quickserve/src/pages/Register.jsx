import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  Grid,
  Alert,
} from '@mui/material';
import { Google, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import authService from '../services/auth.service';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formData, setFormData] = React.useState({
    user_name: '',
    first_name: '',
    last_name: '',
    business_name: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const [formErrors, setFormErrors] = React.useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.user_name) {
      errors.user_name = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.user_name)) {
      errors.user_name = 'Username can only contain letters, numbers and underscores';
    } else if (formData.user_name.length < 3) {
      errors.user_name = 'Username must be at least 3 characters long';
    }

    if (!formData.first_name) {
      errors.first_name = 'First name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.first_name)) {
      errors.first_name = 'First name can only contain letters and spaces';
    } else if (formData.first_name.length < 2) {
      errors.first_name = 'First name must be at least 2 characters long';
    }

    if (!formData.last_name) {
      errors.last_name = 'Last name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.last_name)) {
      errors.last_name = 'Last name can only contain letters and spaces';
    } else if (formData.last_name.length < 2) {
      errors.last_name = 'Last name must be at least 2 characters long';
    }

    if (!formData.business_name) {
      errors.business_name = 'Business name is required';
    } else if (formData.business_name.length < 2) {
      errors.business_name = 'Business name must be at least 2 characters long';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
    }

    if (!formData.phone_number) {
      errors.phone_number = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone_number)) {
      errors.phone_number = 'Phone number must be 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await authService.register(formData);
      if (response.data && response.data.token) {
        login(response.data.token);
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      // Handle specific error cases
      if (err.status === 409) {
        // Handle duplicate user error with field-specific message
        const field = err.field || 'username or email';
        let fieldName = field;
        
        // Map backend field names to form field names
        if (field === 'username') fieldName = 'user_name';
        if (field === 'email') fieldName = 'email';
        if (field === 'phone_number') fieldName = 'phone_number';
        
        // Clear previous form errors
        const newFormErrors = { ...formErrors };
        
        // Set the specific field error
        newFormErrors[fieldName] = `This ${field} is already in use`;
        setFormErrors(newFormErrors);
        
        // Scroll to the field with error
        const errorField = document.querySelector(`[name="${fieldName}"]`);
        if (errorField) {
          errorField.focus();
          errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        setError(`Account creation failed: ${err.message}`);
      } else if (err.status === 400) {
        // Handle validation errors
        setError(`Validation error: ${err.message}`);
      } else if (err.status === 500) {
        // Handle server errors
        setError('Server error. Please try again later.');
      } else {
        // Handle other errors
        const errorMessage = err.message || 'Failed to create account';
        setError(errorMessage);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'grey.50',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box
            component="img"
            src="/src/Qs.png"
            alt="QuickServe Logo"
            sx={{
              height: 60,
              width: 'auto',
              mb: 2,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          />
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Create an Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Get started with QuickServe
          </Typography>
        </Box>

        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Username"
                  name="user_name"
                  variant="outlined"
                  autoComplete="username"
                  value={formData.user_name}
                  onChange={handleChange}
                  error={!!formErrors.user_name}
                  helperText={formErrors.user_name}
                  required
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone_number"
                      variant="outlined"
                      autoComplete="tel"
                      value={formData.phone_number}
                      onChange={handleChange}
                      error={!!formErrors.phone_number}
                      helperText={formErrors.phone_number}
                      required
                      inputProps={{
                        maxLength: 10,
                        pattern: '[0-9]*'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      variant="outlined"
                      autoComplete="given-name"
                      value={formData.first_name}
                      onChange={handleChange}
                      error={!!formErrors.first_name}
                      helperText={formErrors.first_name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      variant="outlined"
                      autoComplete="family-name"
                      value={formData.last_name}
                      onChange={handleChange}
                      error={!!formErrors.last_name}
                      helperText={formErrors.last_name}
                      required
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Business Name"
                  name="business_name"
                  variant="outlined"
                  autoComplete="organization"
                  value={formData.business_name}
                  onChange={handleChange}
                  error={!!formErrors.business_name}
                  helperText={formErrors.business_name}
                  required
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  variant="outlined"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Create Account
                </Button>

                <Divider>or</Divider>

              

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  Already have an account?{' '}
                  <Typography
                    component="span"
                    variant="body2"
                    color="primary"
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => navigate('/login')}
                  >
                    Sign in
                  </Typography>
                </Typography>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}