import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { fetchDevices, createDevice, updateDevice, deleteDevice } from '../store/slices/devicesSlice';

const protocols = ['SNMP', 'WebPA', 'TR69', 'TR369'];

// PUBLIC_INTERFACE
/**
 * Devices page component
 * Displays device list with CRUD operations
 */
const Devices = () => {
  const dispatch = useDispatch();
  const { devices, pagination, loading } = useSelector((state) => state.devices);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    protocol: 'SNMP',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchDevices({ page: page + 1, pageSize: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (device = null) => {
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
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDevice(null);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (editingDevice) {
      await dispatch(updateDevice({ deviceId: editingDevice.id, deviceData: formData }));
    } else {
      await dispatch(createDevice(formData));
    }
    handleCloseDialog();
    dispatch(fetchDevices({ page: page + 1, pageSize: rowsPerPage }));
  };

  const handleDelete = async (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      await dispatch(deleteDevice(deviceId));
      dispatch(fetchDevices({ page: page + 1, pageSize: rowsPerPage }));
    }
  };

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Device
        </Button>
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
            {devices.map((device) => (
              <TableRow key={device.id}>
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
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(device)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(device.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {devices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No devices found. Click &quot;Add Device&quot; to create one.
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
