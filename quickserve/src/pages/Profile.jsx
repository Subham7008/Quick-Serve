import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Save,
  Notifications,
  Security,
  Language,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import authService from '../services/auth.service';

export default function Profile() {
  const [editMode, setEditMode] = React.useState(false);
  const [profileData, setProfileData] = React.useState(null);
  const [formData, setFormData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      await authService.updateProfile(formData);
      const updatedData = await authService.getProfile();
      setProfileData(updatedData);
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  React.useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await authService.getProfile();
        setProfileData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch profile data');
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Typography>Loading profile data...</Typography>
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal information and account settings
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Overview Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', mb: { xs: 2, md: 0 } }}>
              <CardContent>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      fontSize: '3rem',
                      bgcolor: 'primary.main',
                    }}
                  >
                    {profileData?.first_name?.[0]}{profileData?.last_name?.[0]}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                    size="small"
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {`${profileData?.first_name} ${profileData?.last_name}`}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {profileData?.business_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Member since ${new Date(profileData?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                </Typography>

                <Button
                  variant={editMode ? "outlined" : "contained"}
                  startIcon={editMode ? <Save /> : <Edit />}
                  sx={{ mt: 3 }}
                  onClick={() => {
                    if (editMode) {
                      handleSaveChanges();
                    } else {
                      setFormData(profileData);
                      setEditMode(true);
                    }
                  }}
                >
                  {editMode ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Personal Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Personal Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={editMode ? formData?.first_name || '' : profileData?.first_name || ''}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="last_name"
                        value={editMode ? formData?.last_name || '' : profileData?.last_name || ''}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileData?.email || ''}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone_number"
                        value={editMode ? formData?.phone_number || '' : profileData?.phone_number || ''}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Business Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Business Name"
                        name="business_name"
                        value={editMode ? formData?.business_name || '' : profileData?.business_name || ''}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Business Address"
                        defaultValue="123 Tech Street, Silicon Valley, CA 94025"
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Business Email"
                        defaultValue="contact@techfix.com"
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Business Phone"
                        defaultValue="+1 (555) 987-6543"
                        disabled={!editMode}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Account Settings
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Notifications color="primary" />
                        <Box>
                          <Typography variant="subtitle2">Email Notifications</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Receive email notifications for new service requests
                          </Typography>
                        </Box>
                      </Stack>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label=""
                      />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Security color="primary" />
                        <Box>
                          <Typography variant="subtitle2">Two-Factor Authentication</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add an extra layer of security to your account
                          </Typography>
                        </Box>
                      </Stack>
                      <FormControlLabel
                        control={<Switch />}
                        label=""
                      />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Language color="primary" />
                        <Box>
                          <Typography variant="subtitle2">Language Preference</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Choose your preferred language
                          </Typography>
                        </Box>
                      </Stack>
                      <TextField
                        select
                        defaultValue="english"
                        size="small"
                        sx={{ width: 150 }}
                        disabled={!editMode}
                      >
                        <MenuItem value="english">English</MenuItem>
                        <MenuItem value="spanish">Spanish</MenuItem>
                        <MenuItem value="french">French</MenuItem>
                      </TextField>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}