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
import { Add as AddIcon, Send as SendIcon } from '@mui/icons-material';
import { fetchDevices } from '../../store/slices/devicesSlice';
import { addActiveQuery } from '../../store/slices/queriesSlice';
import * as protocolsApi from '../../api/protocols';

const operations = ['GET', 'SET'];

// PUBLIC_INTERFACE
/**
 * WebPA protocol page component
 * Provides interface for WebPA operations (GET, SET)
 */
const WebPAPage = () => {
  const dispatch = useDispatch();
  const { devices } = useSelector((state) => state.devices);

  const [operation, setOperation] = useState('GET');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [parameters, setParameters] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchDevices({ pageSize: 100 }));
  }, [dispatch]);

  const webpaDevices = devices.filter(d => d.protocol === 'WebPA');

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

  const handleSubmit = async () => {
    setError('');
    setResult(null);

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

      switch (operation) {
        case 'GET':
          response = await protocolsApi.webpaGet(requestData);
          break;
        case 'SET':
          response = await protocolsApi.webpaSet(requestData);
          break;
        default:
          throw new Error('Invalid operation');
      }

      setResult(response);

      if (response.jobId) {
        dispatch(addActiveQuery({
          jobId: response.jobId,
          queryData: {
            protocol: 'WebPA',
            operation,
            deviceId: selectedDevice,
            parameters: validParams,
          },
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        WebPA Protocol
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Execute WebPA operations for TR-181 data model parameters
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
              {webpaDevices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name} ({device.ipAddress})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Parameters
              </Typography>
              {parameters.map((param, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., Device.WiFi.SSID.1.SSID"
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
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>

            {result ? (
              <Box>
                <Box mb={2}>
                  <Chip
                    label={`Job ID: ${result.jobId}`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={result.status || 'Pending'}
                    color="info"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>

                {result.data && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Parameter</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(result.data).map(([param, value]) => (
                          <TableRow key={param}>
                            <TableCell>{param}</TableCell>
                            <TableCell>{String(value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {result.message && (
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

export default WebPAPage;
