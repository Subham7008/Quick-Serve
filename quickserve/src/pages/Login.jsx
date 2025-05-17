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
  Alert,
} from '@mui/material';
import { Google, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import authService from '../services/auth.service';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formData, setFormData] = React.useState({
    user_name: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authService.login(formData.user_name, formData.password);
      login(response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
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
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to continue to QuickServe
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
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
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
                  Sign in
                </Button>
                <Divider>or</Divider>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  Create an account?{' '}
                  <Typography
                    component="span"
                    variant="body2"
                    color="primary"
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => navigate('/register')}
                  >
                    Sign up
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