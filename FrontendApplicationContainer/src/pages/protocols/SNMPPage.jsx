import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { snmpGet, snmpSet, snmpWalk } from '../../api/protocols/snmp';
import { showSnackbar } from '../../store/uiSlice';
import { exportJSON, exportCSV } from '../../utils/exporters';

const STORAGE_KEY = 'snmp_form_values';

// PUBLIC_INTERFACE
function SNMPPage() {
  /**
   * SNMP Protocol Operations Page
   * Provides UI for SNMP GET, SET, and WALK operations
   */
  const dispatch = useDispatch();
  const [operation, setOperation] = useState(0); // 0=GET, 1=SET, 2=WALK
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Form fields
  const [deviceId, setDeviceId] = useState('');
  const [oid, setOid] = useState('');
  const [version, setVersion] = useState('v2c');
  const [community, setCommunity] = useState('public');
  const [value, setValue] = useState('');
  const [valueType, setValueType] = useState('OctetString');
  const [maxRepetitions, setMaxRepetitions] = useState(25);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Load persisted values on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDeviceId(parsed.deviceId || '');
        setOid(parsed.oid || '');
        setVersion(parsed.version || 'v2c');
        setCommunity(parsed.community || 'public');
        setMaxRepetitions(parsed.maxRepetitions || 25);
      }
    } catch (err) {
      console.error('Failed to load persisted form values:', err);
    }
  }, []);

  // Persist values on change
  const persistValues = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        deviceId,
        oid,
        version,
        community,
        maxRepetitions,
      }));
    } catch (err) {
      console.error('Failed to persist form values:', err);
    }
  };

  useEffect(() => {
    persistValues();
  }, [deviceId, oid, version, community, maxRepetitions]);

  const validate = () => {
    const newErrors = {};
    if (!deviceId.trim()) newErrors.deviceId = 'Device ID is required';
    if (!oid.trim()) newErrors.oid = 'OID is required';
    if (operation === 1 && !value.trim()) newErrors.value = 'Value is required for SET operation';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExecute = async () => {
    if (!validate()) {
      dispatch(showSnackbar({ message: 'Please fix validation errors', severity: 'error' }));
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let result;
      if (operation === 0) {
        // GET
        result = await snmpGet({ deviceId, oid, version, community });
      } else if (operation === 1) {
        // SET
        result = await snmpSet({ deviceId, oid, value, valueType, version, community });
      } else if (operation === 2) {
        // WALK
        result = await snmpWalk({ deviceId, oid, version, community, maxRepetitions });
      }
      setResults(result);
      dispatch(showSnackbar({ message: 'Operation completed successfully', severity: 'success' }));
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Operation failed';
      setError(errorMessage);
      dispatch(showSnackbar({ message: errorMessage, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJSON = () => {
    if (results) {
      navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      dispatch(showSnackbar({ message: 'Copied to clipboard', severity: 'success' }));
    }
  };

  const handleExportCSV = () => {
    if (!results) return;
    
    let rows = [];
    if (operation === 2 && results.results) {
      // WALK results
      rows = results.results.map(r => ({
        oid: r.oid,
        value: r.value,
        type: r.type,
      }));
    } else {
      // GET or SET
      rows = [{
        oid: results.oid || oid,
        value: results.value || results.newValue || '',
        type: results.type || valueType,
        previousValue: results.previousValue || '',
      }];
    }
    exportCSV(rows, `snmp_${operation === 0 ? 'get' : operation === 1 ? 'set' : 'walk'}_${Date.now()}.csv`);
    dispatch(showSnackbar({ message: 'Exported to CSV', severity: 'success' }));
  };

  const handleExportJSON = () => {
    if (results) {
      exportJSON(results, `snmp_${operation === 0 ? 'get' : operation === 1 ? 'set' : 'walk'}_${Date.now()}.json`);
      dispatch(showSnackbar({ message: 'Exported to JSON', severity: 'success' }));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        SNMP Protocol Operations
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Perform SNMP GET, SET, and WALK operations on network devices using SNMPv2c or SNMPv3.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operation
              </Typography>
              <Tabs value={operation} onChange={(e, v) => setOperation(v)} sx={{ mb: 3 }}>
                <Tab label="GET" />
                <Tab label="SET" />
                <Tab label="WALK" />
              </Tabs>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Device ID"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  required
                  error={!!errors.deviceId}
                  helperText={errors.deviceId || 'Device identifier or hostname'}
                  placeholder="device-001 or 192.168.1.1"
                  fullWidth
                />

                <TextField
                  label="OID"
                  value={oid}
                  onChange={(e) => setOid(e.target.value)}
                  required
                  error={!!errors.oid}
                  helperText={errors.oid || (operation === 2 ? 'Starting OID for walk' : 'Object Identifier')}
                  placeholder="1.3.6.1.2.1.1.1.0"
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel>SNMP Version</InputLabel>
                  <Select
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    label="SNMP Version"
                  >
                    <MenuItem value="v2c">SNMPv2c</MenuItem>
                    <MenuItem value="v3">SNMPv3</MenuItem>
                  </Select>
                  <FormHelperText>Protocol version to use</FormHelperText>
                </FormControl>

                <TextField
                  label="Community String"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  helperText={operation === 1 ? 'Use "private" for write operations' : 'Usually "public" for read'}
                  placeholder={operation === 1 ? 'private' : 'public'}
                  fullWidth
                />

                {operation === 1 && (
                  <>
                    <TextField
                      label="Value"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      required
                      error={!!errors.value}
                      helperText={errors.value || 'Value to set'}
                      placeholder="192.168.1.1"
                      fullWidth
                    />
                    <FormControl fullWidth>
                      <InputLabel>Value Type</InputLabel>
                      <Select
                        value={valueType}
                        onChange={(e) => setValueType(e.target.value)}
                        label="Value Type"
                      >
                        <MenuItem value="OctetString">OctetString</MenuItem>
                        <MenuItem value="Integer">Integer</MenuItem>
                        <MenuItem value="IpAddress">IpAddress</MenuItem>
                        <MenuItem value="Counter32">Counter32</MenuItem>
                        <MenuItem value="Counter64">Counter64</MenuItem>
                        <MenuItem value="Gauge32">Gauge32</MenuItem>
                        <MenuItem value="TimeTicks">TimeTicks</MenuItem>
                        <MenuItem value="Opaque">Opaque</MenuItem>
                      </Select>
                      <FormHelperText>Data type of the value</FormHelperText>
                    </FormControl>
                  </>
                )}

                {operation === 2 && (
                  <TextField
                    label="Max Repetitions"
                    type="number"
                    value={maxRepetitions}
                    onChange={(e) => setMaxRepetitions(parseInt(e.target.value) || 25)}
                    helperText="Maximum number of repetitions for BULK requests"
                    fullWidth
                  />
                )}

                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                  onClick={handleExecute}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Executing...' : 'Execute'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Results</Typography>
                {results && (
                  <Box>
                    <Tooltip title="Copy JSON">
                      <IconButton onClick={handleCopyJSON} size="small">
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export CSV">
                      <IconButton onClick={handleExportCSV} size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export JSON">
                      <IconButton onClick={handleExportJSON} size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {results && !loading && (
                <Box>
                  {operation === 2 ? (
                    // WALK results table
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>OID</strong></TableCell>
                            <TableCell><strong>Value</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {results.results?.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                {row.oid}
                              </TableCell>
                              <TableCell>{row.value}</TableCell>
                              <TableCell>
                                <Chip label={row.type} size="small" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    // GET/SET results
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">OID</Typography>
                          <Typography sx={{ fontFamily: 'monospace' }}>{results.oid || oid}</Typography>
                        </Box>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Value</Typography>
                          <Typography>{results.value || results.newValue || 'N/A'}</Typography>
                        </Box>
                        {results.type && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Type</Typography>
                              <Typography><Chip label={results.type} size="small" /></Typography>
                            </Box>
                          </>
                        )}
                        {results.previousValue && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Previous Value</Typography>
                              <Typography>{results.previousValue}</Typography>
                            </Box>
                          </>
                        )}
                        {results.timestamp && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Timestamp</Typography>
                              <Typography variant="body2">{new Date(results.timestamp).toLocaleString()}</Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Paper>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Raw JSON Response</Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 1, maxHeight: 200, overflow: 'auto' }}>
                      <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                        {JSON.stringify(results, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                </Box>
              )}

              {!results && !loading && !error && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography>Execute an operation to see results</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SNMPPage;
