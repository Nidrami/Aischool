import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Button,
  Divider,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  // Removing unused MUI components
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  // Menu as MenuIcon, // Unused
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  // VideoCall as VideoCallIcon, // Unused
  People as PeopleIcon,
  Grade as GradeIcon,
  AccountBalanceWallet as WalletIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Payment as PaymentsIcon,
  MonetizationOn as RevenueIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { teacherApplicationAPI } from '../services/api';
import AIChatBot from './chatbot/AIChatBot';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Unused
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [hasApplication, setHasApplication] = useState(false);
  // These role variables are used in menu filtering
  const isTeacherPending = user?.role === 'TEACHER_PENDING';

  // Check if teacher pending has an application
  useEffect(() => {
    if (isTeacherPending) {
      const checkApplication = async () => {
        try {
          // Using axios directly to suppress error messages for 404
          const response = await teacherApplicationAPI.axiosInstance.get('/api/teacher-applications/me', {
            validateStatus: function (status) {
              return status < 500; // Only treat 500+ status codes as errors
            }
          });
          
          // Set hasApplication to true only if we got a 200 response with valid data
          setHasApplication(response.status === 200 && !!response?.data?.id);
        } catch (err) {
          // For server errors (500+), don't show in console
          setHasApplication(false);
        }
      };
      checkApplication();
    }
  }, [isTeacherPending]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // Drawer toggle removed since we don't use the drawer

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  // Dynamic menu items with conditional rendering
  const getMenuItems = () => {
    const baseItems = [
      { 
        text: 'Dashboard', 
        path: '/dashboard', 
        icon: <DashboardIcon />, 
        roles: ['STUDENT', 'TEACHER', 'ADMIN'] 
      },
      { 
        text: 'Application Form', 
        path: '/teacher/apply', 
        icon: <AssignmentIcon color="secondary" />, 
        roles: ['TEACHER_PENDING'] 
      }
    ];
    
    // Only show Application Status if user has submitted an application
    if (isTeacherPending && hasApplication) {
      baseItems.push({
        text: 'Application Status', 
        path: '/teacher/waiting', 
        icon: <AssignmentIcon color="warning" />, 
        roles: ['TEACHER_PENDING'] 
      });
    }
    
    return baseItems;
  };
  
  // Main navigation items - excluding wallet items
  const menuItems = getMenuItems().concat([
    { 
      text: 'Courses', 
      path: '/courses', 
      icon: <SchoolIcon />, 
      roles: ['STUDENT', 'TEACHER', 'ADMIN'] 
    },
    { 
      text: 'My Courses', 
      path: '/my-courses', 
      icon: <GradeIcon />, 
      roles: ['STUDENT'] 
    },
    { 
      text: 'Exercises', 
      path: '/exercises', 
      icon: <AssignmentIcon />, 
      roles: ['STUDENT', 'TEACHER', 'ADMIN'] 
    },
    { 
      text: 'Exams', 
      path: '/exams', 
      icon: <AssignmentIcon color="secondary" />, 
      roles: ['STUDENT', 'TEACHER', 'ADMIN'] 
    },
    { 
      text: 'Teacher Applications', 
      path: '/teacher-applications', 
      icon: <AssignmentIcon color="primary" />, 
      roles: ['ADMIN'] 
    },
    { 
      text: 'Users', 
      path: '/users', 
      icon: <PeopleIcon />, 
      roles: ['ADMIN'] 
    },
  ]);
  
  // Wallet-related items for the side drawer
  const walletItems = [
    { 
      text: 'My Wallet', 
      path: user?.role === 'TEACHER' ? '/teacher/wallet' : '/wallet', 
      icon: <WalletIcon color="success" />, 
      roles: ['STUDENT', 'TEACHER', 'ADMIN'] 
    },
    { 
      text: 'Transactions', 
      path: '/transactions', 
      icon: <CurrencyExchangeIcon />, 
      roles: ['STUDENT', 'ADMIN'] 
    },
    { 
      text: 'Teacher Payments', 
      path: '/admin/payments', 
      icon: <PaymentsIcon color="primary" />, 
      roles: ['ADMIN'] 
    },
    { 
      text: 'Revenue Dashboard', 
      path: '/admin/revenue', 
      icon: <RevenueIcon color="secondary" />, 
      roles: ['ADMIN'] 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  // Drawer removed as per client request

  // Filter wallet items based on user role
  const filteredWalletItems = walletItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  const toggleWalletMenu = () => {
    setWalletMenuOpen(!walletMenuOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Toolbar sx={{ height: 70 }}>
          
          <Typography
            variant="h5"
            component="div"
            sx={{ 
              flexGrow: 0, 
              mr: 4, 
              cursor: 'pointer',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
            onClick={() => navigate('/dashboard')}
          >
            <Box
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fff', 
                width: 42,
                height: 42,
                borderRadius: '4px',
                mr: 1.5,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <SchoolIcon 
                sx={{ 
                  color: '#00843D', 
                  fontSize: 30,
                  filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' 
                }} 
              />
            </Box>
            School of Excellence
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: 'flex', gap: { xs: 0.5, sm: 1, md: 2 }, ml: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            {filteredMenuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  position: 'relative',
                  px: { xs: 1, sm: 1.5, md: 2 },
                  py: 1,
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  borderRadius: '8px',
                  backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&::after': location.pathname === item.path ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: '30%',
                    height: '3px',
                    backgroundColor: 'white',
                    transform: 'translateX(-50%)',
                    borderRadius: '3px 3px 0 0',
                  } : {},
                }}
              >
                {item.text}
              </Button>
            ))}

            {/* Wallet Button - Only show if user has access to wallet items */}
            {filteredWalletItems.length > 0 && (
              <Button
                color="inherit"
                startIcon={<WalletIcon color="success" />}
                onClick={toggleWalletMenu}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  position: 'relative',
                  px: { xs: 1, sm: 1.5, md: 2 },
                  py: 1,
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  borderRadius: '8px',
                  backgroundColor: walletMenuOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Wallet & Payments
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.1)', 
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' } 
            }}>
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton 
              color="inherit" 
              onClick={handleProfileMenuOpen}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.1)', 
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                p: 0.5
              }}
            >
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: 'secondary.main',
                border: '2px solid rgba(255, 255, 255, 0.8)'
              }}>
                {user?.firstName?.charAt(0) || <PersonIcon />}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                  borderRadius: 2,
                  minWidth: 220,
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: 1, py: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      mb: 1,
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {user?.firstName?.charAt(0) || <PersonIcon />}
                  </Avatar>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {user?.email}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'white',
                      bgcolor: 'primary.main',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 10,
                      fontWeight: 500
                    }}
                  >
                    {user?.role}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => {
                  navigate('/profile');
                  handleProfileMenuClose();
                }}
                sx={{ 
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  '&:hover': { bgcolor: 'rgba(106, 76, 147, 0.08)' }
                }}
              >
                <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">My Profile</Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  '&:hover': { bgcolor: 'rgba(106, 76, 147, 0.08)' }
                }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side panel removed as per client request */}

      {/* Wallet Side Drawer */}
      <Drawer
        anchor="right"
        open={walletMenuOpen}
        onClose={toggleWalletMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '85%', sm: '350px' },
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
            boxShadow: '0 0 15px rgba(0,0,0,0.1)',
            borderLeft: `1px solid ${theme.palette.divider}`,
            mt: '70px', // Align with the top of the content below the AppBar
            height: 'calc(100% - 70px)'
          },
        }}
        variant="temporary"
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WalletIcon sx={{ mr: 1 }} color="success" />
            Wallet & Payments
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {filteredWalletItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    toggleWalletMenu();
                  }}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(106, 76, 147, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(106, 76, 147, 0.12)',
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          mt: 9,
          width: '100%',
          background: 'linear-gradient(135deg, rgba(106,76,147,0.02) 0%, rgba(56,178,172,0.03) 100%)',
          minHeight: 'calc(100vh - 70px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'url("data:image/svg+xml,%3Csvg width=\'100%\' height=\'100%\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'a\' gradientUnits=\'userSpaceOnUse\' x1=\'0\' x2=\'1000\' y1=\'0\' y2=\'1000\'%3E%3Cstop offset=\'0\' stop-color=\'%236a4c93\' stop-opacity=\'0.03\' /%3E%3Cstop offset=\'1\' stop-color=\'%2338b2ac\' stop-opacity=\'0.04\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d=\'M0,1000L1000,0L1000,1000Z\' fill=\'url(%23a)\' /%3E%3C/svg%3E") no-repeat',
            backgroundSize: 'cover',
            zIndex: -1,
            opacity: 0.7,
          }
        }}
      >
        <Box sx={{ py: 4, px: 3, flexGrow: 1 }}>
          <Outlet />
          {/* AI Chatbot available to all users */}
          <AIChatBot />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
