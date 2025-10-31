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

const operations = ['GetParameterValues', 'SetParameterValues'];

// PUBLIC_INTERFACE
/**
 * TR69 protocol page component
 * Provides interface for TR69/ACS operations
 */
const TR69Page = () => {
  const dispatch = useDispatch();
  const { devices } = useSelector((state) => state.devices);
  const { showToast } = useToast();

  const [operation, setOperation] = useState('GetParameterValues');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [parameters, setParameters] = useState(['']);
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

  const tr69Devices = devices.filter(d => d.protocol === 'TR69');

  const handleAddParameter = () => {
    setParameters([...parameters, '']);
  };

  const handleParameterChange = (index, value) => {
    const newParams = [...parameters];
    newParams[index] = value;
    setParameters(newParams);
  };

  const handleRemoveParameter = (index) => {
    if (parameters.length > 1) {
      const newParams = parameters.filter((_, i) => i !== index);
      setParameters(newParams);
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

    const validParams = parameters.filter(param => param.trim() !== '');
    if (validParams.length === 0) {
      setError('Please enter at least one parameter');
      return;
    }

    setLoading(true);

    try {
      let response;
      const requestData = {
        deviceId: selectedDevice,
        parameters: validParams,
      };

      if (operation === 'GetParameterValues') {
        response = await protocolsApi.tr69GetParameters(requestData);
      } else {
        response = await protocolsApi.tr69SetParameters(requestData);
      }

      setResult(response);

      if (response.jobId) {
        setCurrentJobId(response.jobId);
        dispatch(addActiveQuery({
          jobId: response.jobId,
          queryData: {
            protocol: 'TR69',
            operation,
            deviceId: selectedDevice,
            parameters: validParams,
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
        TR-69 Protocol
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Execute TR-69/ACS operations using ECO ACS REST API
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
              {tr69Devices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name} ({device.ipAddress})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Parameters (TR-181)
              </Typography>
              {parameters.map((param, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., InternetGatewayDevice.DeviceInfo.ModelName"
                    value={param}
                    onChange={(e) => handleParameterChange(index, e.target.value)}
                  />
                  {parameters.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRemoveParameter(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddParameter}
                size="small"
                sx={{ mt: 1 }}
              >
                Add Parameter
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
                          <TableCell>Parameter</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(result?.data || activeQuery?.data || {}).map(([param, value]) => (
                          <TableRow key={param}>
                            <TableCell>{param}</TableCell>
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

export default TR69Page;
