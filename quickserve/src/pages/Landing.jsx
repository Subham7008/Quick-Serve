import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Fade,
  TextField,
  Chip,
} from '@mui/material';
import {
  Speed,
  Security,
  DevicesOther,
  Assignment,
  MonetizationOn,
  Support,
  Menu as MenuIcon,
  Laptop,
  Phone,
  Print,
  CheckCircle,
  Schedule,
  LocalShipping,
} from '@mui/icons-material';

const features = [
  {
    icon: <Speed sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Quick Service',
    description: 'Fast and efficient repair service for all your devices',
  },
  {
    icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Secure Tracking',
    description: 'Real-time updates on your device repair status',
  },
  {
    icon: <DevicesOther sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'All Devices',
    description: 'Support for laptops, desktops, printers, and more',
  },
  {
    icon: <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Digital Records',
    description: 'Paperless service records and history tracking',
  },
  {
    icon: <MonetizationOn sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Transparent Pricing',
    description: 'Clear upfront costs with no hidden charges',
  },
  {
    icon: <Support sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: '24/7 Support',
    description: 'Round-the-clock customer service assistance',
  },
];

const pricingPlans = [
  {
    title: 'Basic',
    price: '₹2,499',
    period: '/month',
    features: [
      'Up to 100 repair tickets',
      'Basic customer management',
      'Email support',
      'Basic reporting',
      'Single user access',
    ],
    buttonText: 'Start Basic',
    buttonVariant: 'outlined',
  },
  {
    title: 'Professional',
    price: '₹5,999',
    period: '/month',
    features: [
      'Unlimited repair tickets',
      'Advanced customer management',
      'Priority email & phone support',
      'Advanced analytics',
      'Up to 5 team members',
      'Inventory management',
    ],
    buttonText: 'Start Pro',
    buttonVariant: 'contained',
    featured: true,
  },
  {
    title: 'Enterprise',
    price: '₹14,999',
    period: '/month',
    features: [
      'Unlimited everything',
      'Custom integrations',
      '24/7 dedicated support',
      'Custom reporting',
      'Unlimited team members',
      'Multi-location support',
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outlined',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <Box 
      sx={{ 
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        bgcolor: 'background.default',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Navbar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1 }}>
            {/* Logo */}
            <Box
              onClick={() => navigate('/')}
              sx={{
                flexGrow: { xs: 1, md: 0 },
                mr: { md: 8 },
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src="/src/Qs.png"
                alt="QuickServe Logo"
                sx={{
                  height: '55px',
                  width: 'auto',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  my: 1,
                }}
              />
            </Box>

            {/* Desktop Navigation */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'none', md: 'flex' },
                gap: 4,
              }}
            >
              {navItems.map((item) => (
                <Typography
                  key={item.label}
                  component="a"
                  href={item.href}
                  sx={{
                    color: 'text.primary',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>

            {/* Auth Buttons */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                display: { xs: 'none', md: 'flex' },
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/login')}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/register')}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>

            {/* Mobile Menu */}
            <IconButton
              size="large"
              edge="end"
              onClick={handleMenu}
              color="primary"
              sx={{
                display: { xs: 'flex', md: 'none' },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              TransitionComponent={Fade}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  minWidth: 200,
                },
              }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={handleClose}
                  component="a"
                  href={item.href}
                  sx={{
                    py: 1.5,
                    px: 3,
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Sign In
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/register')}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed AppBar */}

      {/* Hero Section */}
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("/hero-pattern.svg")',
            opacity: 0.1,
            zIndex: 1,
          },
        }}
      >
        <Container 
          maxWidth={false} 
          sx={{ 
            position: 'relative', 
            zIndex: 2,
            width: '100%',
            px: { xs: 2, sm: 3, md: 4 },
            mx: 0
          }}
        >
          <Grid 
            container 
            spacing={4} 
            alignItems="center" 
            justifyContent="space-between"
            sx={{ 
              minHeight: '100vh',
              width: '100%',
              margin: 0
            }}
          >
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  animation: 'fadeIn 1s ease-out',
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                <Typography 
                  variant="h1" 
                  component="h1" 
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    mb: 3,
                  }}
                >
                  Streamline Your Service Center
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4,
                    fontWeight: 500,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    opacity: 0.9,
                    maxWidth: '90%'
                  }}
                >
                  Manage repairs, track devices, and delight customers with our all-in-one solution.
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  sx={{ mb: { xs: 4, md: 0 } }}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      }
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      borderWidth: 2,
                      textTransform: 'none',
                      '&:hover': {
                        borderWidth: 2,
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid 
              item 
              xs={12} 
              md={6}
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  animation: 'floatAnimation 3s ease-in-out infinite',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -40,
                    left: '10%',
                    width: '80%',
                    height: 20,
                    background: 'rgba(0,0,0,0.2)',
                    filter: 'blur(10px)',
                    borderRadius: '50%',
                    animation: 'shadowAnimation 3s ease-in-out infinite',
                  }
                }}
              >
                {/* Dashboard Preview */}
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: 600,
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: (theme) => `0 24px 48px rgba(0, 0, 0, 0.2)`,
                    background: '#ffffff',
                  }}
                >
                  {/* Dashboard Header */}
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Service Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label="Today" color="primary" size="small" />
                      <Chip label="This Week" variant="outlined" size="small" />
                    </Box>
                  </Box>

                  {/* Dashboard Content */}
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Recent Services */}
                    <Typography variant="h6" sx={{ mb: { xs: 1.5, sm: 2 }, color: 'text.primary', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                      Recent Services
                    </Typography>
                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                      {[
                        { icon: <Laptop />, device: 'MacBook Pro', issue: 'Battery Replacement', status: 'In Progress' },
                        { icon: <Phone />, device: 'iPhone 13', issue: 'Screen Repair', status: 'Completed' },
                        { icon: <Print />, device: 'HP Printer', issue: 'Maintenance', status: 'Pending' },
                      ].map((service, index) => (
                        <Card
                          key={index}
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 1, sm: 2 },
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Box
                            sx={{
                              p: { xs: 0.75, sm: 1 },
                              borderRadius: 1,
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                              display: 'flex',
                            }}
                          >
                            {service.icon}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {service.device}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {service.issue}
                            </Typography>
                          </Box>
                          <Chip
                            label={service.status}
                            color={service.status === 'Completed' ? 'success' : service.status === 'In Progress' ? 'primary' : 'warning'}
                            size="small"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          />
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3rem' },
                mb: 2,
              }}
            >
              Features
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Everything you need to manage your service center efficiently
            </Typography>
          </Box>
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    p: { xs: 2, sm: 3, md: 4 },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: (theme) => theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 0, flexGrow: 1 }}>
                    <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>{feature.icon}</Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box
        id="pricing"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: 'grey.50',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3rem' },
                mb: 2,
              }}
            >
              Pricing Plans
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Choose the perfect plan for your business
            </Typography>
          </Box>
          <Grid container spacing={4} alignItems="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 4,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    transform: 'none',
                    border: '1px solid transparent',
                    borderColor: 'transparent',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      boxShadow: (theme) => theme.shadows[10],
                      zIndex: 1,
                    },
                  }}
                >
                  {plan.featured && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Most Popular
                    </Box>
                  )}
                  <Typography variant="h4" component="h3" gutterBottom>
                    {plan.title}
                  </Typography>
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h3"
                      component="span"
                      sx={{ fontWeight: 700 }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="span"
                      color="text.secondary"
                    >
                      {plan.period}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <Box
                        key={featureIndex}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            opacity: 0.1,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        </Box>
                        <Typography>{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant={plan.buttonVariant}
                    color="primary"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      mt: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box
        id="about"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4,
                }}
              >
                <Box
                  component="img"
                  src="/src/Qs.png"
                  alt="QuickServe Logo"
                  sx={{
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                    filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.15))',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 4,
                }}
              >
                About QuickServe
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}
              >
                QuickServe was founded with a simple mission: to make service center
                management effortless. Our platform combines powerful features with
                an intuitive interface, helping businesses streamline their
                operations and provide exceptional customer service.
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}
              >
                With years of experience in the industry, we understand the
                challenges service centers face. That's why we've built a solution
                that addresses real needs and delivers real results.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Learn More
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box
        id="contact"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: 'grey.50',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 4,
                }}
              >
                Get in Touch
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}
              >
                Have questions about QuickServe? Our team is here to help.
                Contact us for more information about our services or to schedule
                a demo.
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Our Office
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  123 Service Street
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Tech City, TC 12345
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  United States
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Contact Info
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Email: support@quickserve.com
                </Typography>
                <Typography color="text.secondary">
                  Phone: +1 (555) 123-4567
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 4 }}
                >
                  Send us a Message
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    type="email"
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    Send Message
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          width: '100%',
          bgcolor: 'grey.50',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${theme.palette.divider}, transparent)`,
          }
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: 800,
              mx: 'auto',
              px: 3,
            }}
          >
            <Typography 
              variant="h3" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.75rem' },
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ready to Transform Your Business?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
              sx={{ 
                mb: 6,
                fontWeight: 400,
                lineHeight: 1.8
              }}
            >
              Join thousands of service centers already using QuickServe to streamline their operations
              and provide exceptional customer service.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                }
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          width: '100%',
          bgcolor: 'grey.900',
          color: 'white',
          py: 6,
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                QuickServe
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ maxWidth: 300 }}>
                Empowering service centers with modern management solutions for seamless operations
                and customer satisfaction.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Contact
              </Typography>
              <Typography variant="body2" color="grey.400">
                Email: support@quickserve.com
                <br />
                Phone: +1 (555) 123-4567
                <br />
                Address: 123 Service Street, Tech City
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Legal
              </Typography>
              <Typography variant="body2" color="grey.400">
                Terms of Service
                <br />
                Privacy Policy
                <br />
                Cookie Policy
              </Typography>
            </Grid>
          </Grid>
          <Typography
            variant="body2"
            color="grey.400"
            align="center"
            sx={{ mt: 8 }}
          >
            © {new Date().getFullYear()} QuickServe. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes floatAnimation {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes shadowAnimation {
            0%, 100% {
              transform: scale(1);
              opacity: 0.3;
            }
            50% {
              transform: scale(0.9);
              opacity: 0.2;
            }
          }
        `}
      </style>
    </Box>
  );
}
 