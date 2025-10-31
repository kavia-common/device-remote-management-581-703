import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Send as SendIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { fetchDevices } from '../../store/slices/devicesSlice';
import { 
  addActiveQuery, 
  cancelQuery, 
  selectActiveQueryById,
  selectIsQueryCancelling,
  selectCanCancelQuery,
} from '../../store/slices/queriesSlice';
import * as protocolsApi from '../../api/protocols';
import useToast from '../../hooks/useToast';

const operations = ['GET', 'SET'];

// PUBLIC_INTERFACE
/**
 * TR369 protocol page component
 * Provides interface for TR369/USP operations
 */
const TR369Page = () => {
  const dispatch = useDispatch();
  const { devices } = useSelector((state) => state.devices);
  const { showToast } = useToast();

  const [operation, setOperation] = useState('GET');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [paths, setPaths] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [currentJobId, setCurrentJobId] = useState(null);

  // Realtime query status from Redux store
  const activeQuery = useSelector((state) => 
    currentJobId ? selectActiveQueryById(currentJobId)(state) : null
  );
  const isQueryCancelling = useSelector((state) => 
    currentJobId ? selectIsQueryCancelling(currentJobId)(state) : false
  );
  const canCancelQuery = useSelector((state) => 
    currentJobId ? selectCanCancelQuery(currentJobId)(state) : false
  );

  useEffect(() => {
    dispatch(fetchDevices({ pageSize: 100 }));
  }, [dispatch]);

  const tr369Devices = devices.filter(d => d.protocol === 'TR369');

  const handleAddPath = () => {
    setPaths([...paths, '']);
  };

  const handlePathChange = (index, value) => {
    const newPaths = [...paths];
    newPaths[index] = value;
    setPaths(newPaths);
  };

  const handleRemovePath = (index) => {
    if (paths.length > 1) {
      const newPaths = paths.filter((_, i) => i !== index);
      setPaths(newPaths);
    }
  };

  const handleCancel = async () => {
    if (!currentJobId) return;

    try {
      await dispatch(cancelQuery(currentJobId)).unwrap();
      showToast('Query cancelled successfully', { type: 'success' });
      setCurrentJobId(null);
    } catch (err) {
      showToast(err.message || 'Failed to cancel query', { type: 'error' });
    }
  };

  const handleSubmit = async () => {
    setError('');
    setResult(null);
    setCurrentJobId(null);

    if (!selectedDevice) {
      setError('Please select a device');
      return;
    }

    const validPaths = paths.filter(path => path.trim() !== '');
    if (validPaths.length === 0) {
      setError('Please enter at least one data model path');
      return;
    }

    setLoading(true);

    try {
      let response;
      const requestData = {
        deviceId: selectedDevice,
        paths: validPaths,
      };

      switch (operation) {
        case 'GET':
          response = await protocolsApi.tr369Get(requestData);
          break;
        case 'SET':
          response = await protocolsApi.tr369Set(requestData);
          break;
        default:
          throw new Error('Invalid operation');
      }

      setResult(response);

      if (response.jobId) {
        setCurrentJobId(response.jobId);
        dispatch(addActiveQuery({
          jobId: response.jobId,
          queryData: {
            protocol: 'TR369',
            operation,
            deviceId: selectedDevice,
            paths: validPaths,
          },
        }));
        showToast('Query submitted successfully', { type: 'success' });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Operation failed';
      setError(errorMessage);
      showToast(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        TR-369 (USP) Protocol
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Execute TR-369/USP operations for device management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Operation Parameters
            </Typography>

            <TextField
              select
              fullWidth
              label="Operation"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              margin="normal"
            >
              {operations.map((op) => (
                <MenuItem key={op} value={op}>
                  {op}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Device"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              margin="normal"
            >
              {tr369Devices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name} ({device.ipAddress})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Data Model Paths
              </Typography>
              {paths.map((path, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., Device.DeviceInfo."
                    value={path}
                    onChange={(e) => handlePathChange(index, e.target.value)}
                  />
                  {paths.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRemovePath(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddPath}
                size="small"
                sx={{ mt: 1 }}
              >
                Add Path
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Executing...' : 'Execute'}
            </Button>

            {canCancelQuery && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={isQueryCancelling ? <CircularProgress size={20} /> : <CancelIcon />}
                onClick={handleCancel}
                disabled={isQueryCancelling}
                sx={{ mt: 2 }}
              >
                {isQueryCancelling ? 'Cancelling...' : 'Cancel Query'}
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>

            {result || activeQuery ? (
              <Box>
                <Box mb={2}>
                  <Chip
                    label={`Job ID: ${result?.jobId || currentJobId}`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={activeQuery?.status || result?.status || 'Pending'}
                    color={
                      activeQuery?.status === 'completed' ? 'success' :
                      activeQuery?.status === 'error' ? 'error' :
                      activeQuery?.status === 'cancelled' ? 'warning' :
                      'info'
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                  {activeQuery?.progress !== undefined && (
                    <Chip
                      label={`${activeQuery.progress}%`}
                      color="default"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>

                {activeQuery?.message && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {activeQuery.message}
                  </Alert>
                )}

                {activeQuery?.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {activeQuery.error}
                  </Alert>
                )}

                {(result?.data || activeQuery?.data) && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Path</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(result?.data || activeQuery?.data || {}).map(([path, value]) => (
                          <TableRow key={path}>
                            <TableCell>{path}</TableCell>
                            <TableCell>{String(value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {result?.message && !activeQuery?.message && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {result.message}
                  </Typography>
                )}
              </Box>
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary" align="center">
                    No results yet. Execute an operation to see results here.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TR369Page;
