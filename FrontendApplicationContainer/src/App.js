import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Container,
  Snackbar,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import LanIcon from '@mui/icons-material/Lan';
import RouterIcon from '@mui/icons-material/Router';
import HubIcon from '@mui/icons-material/Hub';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuIcon from '@mui/icons-material/Menu';
import './App.css';
import store from './store';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import DevicesPage from './pages/Devices';
import SettingsPage from './pages/Settings';
import ProtocolPlaceholderPage from './pages/ProtocolPlaceholder';
import ErrorBoundary from './components/ErrorBoundary';
import { hideSnackbar, selectSnackbar } from './store/uiSlice';
import { selectIsAuthenticated, logout } from './store/authSlice';

const drawerWidth = 240;

function NavList({ onNavigate }) {
  const items = [
    { label: 'Dashboard', to: '/', icon: <DashboardIcon /> },
    { label: 'Devices', to: '/devices', icon: <DevicesIcon /> },
    { label: 'SNMP', to: '/protocols/snmp', icon: <LanIcon /> },
    { label: 'WebPA', to: '/protocols/webpa', icon: <RouterIcon /> },
    { label: 'TR-069', to: '/protocols/tr69', icon: <HubIcon /> },
    { label: 'TR-369/USP', to: '/protocols/tr369', icon: <HubIcon /> },
    { label: 'Settings', to: '/settings', icon: <SettingsIcon /> },
    { label: 'Help', to: '/help', icon: <HelpOutlineIcon /> },
  ];
  return (
    <List>
      {items.map((item) => (
        <ListItemButton component={Link} to={item.to} key={item.to} onClick={onNavigate}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isAuthed = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const snackbar = useSelector(selectSnackbar);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Device Manager
        </Typography>
      </Toolbar>
      <Divider />
      <NavList onNavigate={() => setMobileOpen(false)} />
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Device Remote Management
          </Typography>
          {isAuthed ? (
            <Button color="inherit" startIcon={<LockIcon />} onClick={() => dispatch(logout())}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/login" startIcon={<LockIcon />}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="navigation">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Container maxWidth="xl">
          <Routes>
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
            <Route path="/protocols/:name" element={<ProtectedRoute><ProtocolPlaceholderPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/help" element={<ProtocolPlaceholderPage title="Help" description="Documentation coming soon." />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration || 4000}
        onClose={() => dispatch(hideSnackbar())}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => dispatch(hideSnackbar())} severity={snackbar.severity || 'info'} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function ProtectedRoute({ children }) {
  const isAuthed = useSelector(selectIsAuthenticated);
  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const queryClient = new QueryClient();

// PUBLIC_INTERFACE
function App() {
  /** Root application with providers and error boundary. */
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ErrorBoundary>
            <AppShell />
          </ErrorBoundary>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
