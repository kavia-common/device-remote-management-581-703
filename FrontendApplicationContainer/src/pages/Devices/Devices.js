import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { deviceApi } from '../../services/api';

// PUBLIC_INTERFACE
const Devices = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    ipAddress: '',
    protocol: 'SNMP',
    description: '',
  });

  const queryClient = useQueryClient();

  // Fetch devices
  const { data: devicesData, isLoading, error, refetch } = useQuery({
    queryKey: ['devices', page, rowsPerPage],
    queryFn: () => deviceApi.getDevices({
      page: page + 1,
      pageSize: rowsPerPage,
    }),
  });

  // Create device mutation
  const createDeviceMutation = useMutation({
    mutationFn: deviceApi.createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries(['devices']);
      handleCloseDialog();
    },
  });

  // Update device mutation
  const updateDeviceMutation = useMutation({
    mutationFn: ({ id, data }) => deviceApi.updateDevice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['devices']);
      handleCloseDialog();
    },
  });

  // Delete device mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: deviceApi.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries(['devices']);
    },
  });

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
      setDeviceForm({
        name: device.name,
        ipAddress: device.ipAddress,
        protocol: device.protocol,
        description: device.description || '',
      });
    } else {
      setEditingDevice(null);
      setDeviceForm({
        name: '',
        ipAddress: '',
        protocol: 'SNMP',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDevice(null);
    setDeviceForm({
      name: '',
      ipAddress: '',
      protocol: 'SNMP',
      description: '',
    });
  };

  const handleSubmit = () => {
    if (editingDevice) {
      updateDeviceMutation.mutate({
        id: editingDevice.id,
        data: deviceForm,
      });
    } else {
      createDeviceMutation.mutate(deviceForm);
    }
  };

  const handleDelete = (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      deleteDeviceMutation.mutate(deviceId);
    }
  };

  const getProtocolColor = (protocol) => {
    const colors = {
      SNMP: 'primary',
      WebPA: 'secondary',
      TR69: 'success',
      TR369: 'warning',
    };
    return colors[protocol] || 'default';
  };

  const devices = devicesData?.data?.devices || [];
  const totalDevices = devicesData?.data?.total || 0;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Device Management</Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Device
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load devices: {error.message}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>{device.ipAddress}</TableCell>
                  <TableCell>
                    <Chip
                      label={device.protocol}
                      color={getProtocolColor(device.protocol)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{device.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={device.status || 'Online'}
                      color={device.status === 'Online' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(device)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(device.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalDevices}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Device Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDevice ? 'Edit Device' : 'Add New Device'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Device Name"
              value={deviceForm.name}
              onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="IP Address"
              value={deviceForm.ipAddress}
              onChange={(e) => setDeviceForm({ ...deviceForm, ipAddress: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Protocol</InputLabel>
              <Select
                value={deviceForm.protocol}
                onChange={(e) => setDeviceForm({ ...deviceForm, protocol: e.target.value })}
              >
                <MenuItem value="SNMP">SNMP</MenuItem>
                <MenuItem value="WebPA">WebPA</MenuItem>
                <MenuItem value="TR69">TR69</MenuItem>
                <MenuItem value="TR369">TR369</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={deviceForm.description}
              onChange={(e) => setDeviceForm({ ...deviceForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!deviceForm.name || !deviceForm.ipAddress}
          >
            {editingDevice ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Devices;
