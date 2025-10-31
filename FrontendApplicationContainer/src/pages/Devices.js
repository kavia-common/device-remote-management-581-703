import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { fetchDevices, createDevice, updateDevice, deleteDevice } from '../store/slices/devicesSlice';
import { selectHasPermission } from '../store/slices/authSlice';
import { WithPermission } from '../components/withPermission';
import { PERMISSIONS } from '../utils/permissions';
import useToast from '../hooks/useToast';
import useDebouncedValue from '../hooks/useDebouncedValue';

const protocols = ['SNMP', 'WebPA', 'TR69', 'TR369'];

// Memoized device row component for better performance
const DeviceRow = React.memo(({ device, onEdit, onDelete, canWriteDevice, canDeleteDevice }) => (
  <TableRow>
    <TableCell>{device.name}</TableCell>
    <TableCell>{device.ipAddress}</TableCell>
    <TableCell>
      <Chip label={device.protocol} size="small" color="primary" />
    </TableCell>
    <TableCell>
      <Chip
        label={device.status || 'active'}
        size="small"
        color={device.status === 'active' ? 'success' : 'default'}
      />
    </TableCell>
    <TableCell>{device.description}</TableCell>
    <TableCell align="right">
      {/* Gate Edit button behind device:write permission */}
      <WithPermission
        requiredPermissions={[PERMISSIONS.DEVICE_WRITE]}
        fallback={
          <Tooltip title="You don't have permission to edit devices">
            <span>
              <IconButton size="small" color="primary" disabled>
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
        }
      >
        <IconButton
          size="small"
          color="primary"
          onClick={() => onEdit(device)}
        >
          <EditIcon />
        </IconButton>
      </WithPermission>
      
      {/* Gate Delete button behind device:delete permission */}
      <WithPermission
        requiredPermissions={[PERMISSIONS.DEVICE_DELETE]}
        fallback={
          <Tooltip title="You don't have permission to delete devices">
            <span>
              <IconButton size="small" color="error" disabled>
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        }
      >
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(device.id)}
        >
          <DeleteIcon />
        </IconButton>
      </WithPermission>
    </TableCell>
  </TableRow>
));

DeviceRow.displayName = 'DeviceRow';

// PUBLIC_INTERFACE
/**
 * Devices page component
 * Displays device list with CRUD operations and search functionality
 * Implements RBAC for device write and delete operations
 * Uses debounced search to optimize network calls
 */
const Devices = () => {
  const dispatch = useDispatch();
  const { devices, pagination, loading } = useSelector((state) => state.devices);
  const { showToast } = useToast();
  
  // Check permissions for device operations
  const canWriteDevice = useSelector(selectHasPermission(PERMISSIONS.DEVICE_WRITE));
  const canDeleteDevice = useSelector(selectHasPermission(PERMISSIONS.DEVICE_DELETE));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    protocol: 'SNMP',
    description: '',
  });

  // Debounce search term with 300ms delay for responsive typing
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Fetch devices when debounced search term, page, or rowsPerPage changes
  useEffect(() => {
    const params = { 
      page: page + 1, 
      pageSize: rowsPerPage,
    };
    
    // Add search parameter if search term is present
    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }
    
    dispatch(fetchDevices(params));
  }, [dispatch, page, rowsPerPage, debouncedSearchTerm]);

  // Memoized handlers
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setPage(0);
  }, []);

  const handleOpenDialog = useCallback((device = null) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        name: device.name || '',
        ipAddress: device.ipAddress || '',
        protocol: device.protocol || 'SNMP',
        description: device.description || '',
      });
    } else {
      setEditingDevice(null);
      setFormData({
        name: '',
        ipAddress: '',
        protocol: 'SNMP',
        description: '',
      });
    }
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingDevice(null);
  }, []);

  const handleFormChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      if (editingDevice) {
        await dispatch(updateDevice({ deviceId: editingDevice.id, deviceData: formData })).unwrap();
        showToast('Device updated successfully', { type: 'success' });
      } else {
        await dispatch(createDevice(formData)).unwrap();
        showToast('Device created successfully', { type: 'success' });
      }
      handleCloseDialog();
      dispatch(fetchDevices({ page: page + 1, pageSize: rowsPerPage }));
    } catch (error) {
      showToast(error.message || 'Operation failed', { type: 'error' });
    }
  }, [editingDevice, formData, dispatch, showToast, handleCloseDialog, page, rowsPerPage]);

  const handleDelete = useCallback(async (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await dispatch(deleteDevice(deviceId)).unwrap();
        showToast('Device deleted successfully', { type: 'success' });
        dispatch(fetchDevices({ page: page + 1, pageSize: rowsPerPage }));
      } catch (error) {
        showToast(error.message || 'Failed to delete device', { type: 'error' });
      }
    }
  }, [dispatch, showToast, page, rowsPerPage]);

  // Memoize filtered devices for performance
  const displayedDevices = useMemo(() => {
    return devices || [];
  }, [devices]);

  if (loading && devices.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Devices</Typography>
        {/* Gate Add Device button behind device:write permission */}
        <WithPermission
          requiredPermissions={[PERMISSIONS.DEVICE_WRITE]}
          fallback={
            <Tooltip title="You don't have permission to add devices">
              <span>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled
                >
                  Add Device
                </Button>
              </span>
            </Tooltip>
          }
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Device
          </Button>
        </WithPermission>
      </Box>

      {/* Search bar */}
      <Box mb={2}>
        <TextField
          fullWidth
          placeholder="Search devices by name, IP address, or protocol..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                  aria-label="clear search"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Protocol</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedDevices.map((device) => (
              <DeviceRow
                key={device.id}
                device={device}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                canWriteDevice={canWriteDevice}
                canDeleteDevice={canDeleteDevice}
              />
            ))}
            {displayedDevices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {searchTerm 
                    ? `No devices found matching "${searchTerm}"`
                    : 'No devices found. Click "Add Device" to create one.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDevice ? 'Edit Device' : 'Add Device'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Device Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            name="ipAddress"
            label="IP Address"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.ipAddress}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="protocol"
            label="Protocol"
            select
            fullWidth
            variant="outlined"
            value={formData.protocol}
            onChange={handleFormChange}
          >
            {protocols.map((protocol) => (
              <MenuItem key={protocol} value={protocol}>
                {protocol}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDevice ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Devices;
