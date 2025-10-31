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

const operations = ['GET', 'SET', 'WALK'];

// PUBLIC_INTERFACE
/**
 * SNMP protocol page component
 * Provides interface for SNMP operations (GET, SET, WALK)
 */
const SNMPPage = () => {
  const dispatch = useDispatch();
  const { devices } = useSelector((state) => state.devices);

  const [operation, setOperation] = useState('GET');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [oids, setOids] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchDevices({ pageSize: 100 }));
  }, [dispatch]);

  const snmpDevices = devices.filter(d => d.protocol === 'SNMP');

  const handleAddOid = () => {
    setOids([...oids, '']);
  };

  const handleOidChange = (index, value) => {
    const newOids = [...oids];
    newOids[index] = value;
    setOids(newOids);
  };

  const handleRemoveOid = (index) => {
    if (oids.length > 1) {
      const newOids = oids.filter((_, i) => i !== index);
      setOids(newOids);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setResult(null);

    if (!selectedDevice) {
      setError('Please select a device');
      return;
    }

    const validOids = oids.filter(oid => oid.trim() !== '');
    if (validOids.length === 0) {
      setError('Please enter at least one OID');
      return;
    }

    setLoading(true);

    try {
      let response;
      const requestData = {
        deviceId: selectedDevice,
        oids: validOids,
      };

      switch (operation) {
        case 'GET':
          response = await protocolsApi.snmpGet(requestData);
          break;
        case 'SET':
          response = await protocolsApi.snmpSet(requestData);
          break;
        case 'WALK':
          response = await protocolsApi.snmpWalk(requestData);
          break;
        default:
          throw new Error('Invalid operation');
      }

      setResult(response);

      // Add to active queries
      if (response.jobId) {
        dispatch(addActiveQuery({
          jobId: response.jobId,
          queryData: {
            protocol: 'SNMP',
            operation,
            deviceId: selectedDevice,
            oids: validOids,
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
        SNMP Protocol
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Execute SNMP v2/v3 operations: GET, SET, and WALK
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
              {snmpDevices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name} ({device.ipAddress})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                OIDs
              </Typography>
              {oids.map((oid, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., 1.3.6.1.2.1.1.1.0"
                    value={oid}
                    onChange={(e) => handleOidChange(index, e.target.value)}
                  />
                  {oids.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRemoveOid(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddOid}
                size="small"
                sx={{ mt: 1 }}
              >
                Add OID
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
                          <TableCell>OID</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(result.data).map(([oid, value]) => (
                          <TableRow key={oid}>
                            <TableCell>{oid}</TableCell>
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

export default SNMPPage;
