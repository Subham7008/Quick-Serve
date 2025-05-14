import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Tooltip,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Person,
  Assignment,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const pages = [
    { title: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { title: 'Customer Intake', path: '/customer-intake', icon: <Assignment /> },
  ];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleCloseNavMenu();
  };

  return (
    <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Box
            component="img"
            src="/src/Qs.png"
            alt="QuickServe Logo"
            sx={{
              height: 40,
              width: 'auto',
              display: { xs: 'none', md: 'flex' },
              mr: 2,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          />

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="primary"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem 
                  key={page.path} 
                  onClick={() => handleNavigate(page.path)}
                  selected={location.pathname === page.path}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    {page.icon}
                    <Typography textAlign="center">{page.title}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo - Mobile */}
          <Box
            component="img"
            src="/src/Qs.png"
            alt="QuickServe Logo"
            sx={{
              height: 40,
              width: 'auto',
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          />

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
            {pages.map((page) => (
              <Button
                key={page.path}
                onClick={() => handleNavigate(page.path)}
                sx={{
                  mx: 1,
                  color: location.pathname === page.path ? 'primary.main' : 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {page.icon}
                {page.title}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => {
                navigate('/profile');
                handleCloseUserMenu();
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Person fontSize="small" />
                  <Typography textAlign="center">Profile</Typography>
                </Stack>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => {
                logout();
                navigate('/login');
                handleCloseUserMenu();
              }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'error.main' }}>
                  <Logout fontSize="small" />
                  <Typography textAlign="center">Logout</Typography>
                </Stack>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}