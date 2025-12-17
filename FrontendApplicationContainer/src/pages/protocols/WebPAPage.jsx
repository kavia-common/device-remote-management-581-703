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
import { webpaGetParameter, webpaSetParameter } from '../../api/protocols/webpa';
import { showSnackbar } from '../../store/uiSlice';
import { exportJSON, exportCSV } from '../../utils/exporters';

const STORAGE_KEY = 'webpa_form_values';

// PUBLIC_INTERFACE
function WebPAPage() {
  /**
   * WebPA Protocol Operations Page
   * Provides UI for WebPA parameter get and set operations
   */
  const dispatch = useDispatch();
  const [operation, setOperation] = useState(0); // 0=GET, 1=SET
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Form fields
  const [deviceId, setDeviceId] = useState('');
  const [parameter, setParameter] = useState('');
  const [value, setValue] = useState('');
  const [dataType, setDataType] = useState('string');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Load persisted values on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDeviceId(parsed.deviceId || '');
        setParameter(parsed.parameter || '');
        setDataType(parsed.dataType || 'string');
      }
    } catch (err) {
      console.error('Failed to load persisted form values:', err);
    }
  }, []);

  // Persist values on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        deviceId,
        parameter,
        dataType,
      }));
    } catch (err) {
      console.error('Failed to persist form values:', err);
    }
  }, [deviceId, parameter, dataType]);

  const validate = () => {
    const newErrors = {};
    if (!deviceId.trim()) newErrors.deviceId = 'Device ID is required';
    if (!parameter.trim()) newErrors.parameter = 'Parameter name is required';
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
        result = await webpaGetParameter({ deviceId, parameter });
      } else {
        // SET
        result = await webpaSetParameter({ deviceId, parameter, value, dataType });
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
    
    const rows = [{
      parameter: results.parameter || parameter,
      value: results.value || results.newValue || '',
      dataType: results.dataType || dataType,
      previousValue: results.previousValue || '',
    }];
    exportCSV(rows, `webpa_${operation === 0 ? 'get' : 'set'}_${Date.now()}.csv`);
    dispatch(showSnackbar({ message: 'Exported to CSV', severity: 'success' }));
  };

  const handleExportJSON = () => {
    if (results) {
      exportJSON(results, `webpa_${operation === 0 ? 'get' : 'set'}_${Date.now()}.json`);
      dispatch(showSnackbar({ message: 'Exported to JSON', severity: 'success' }));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        WebPA Protocol Operations
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Get and set TR-181 parameters on devices using the WebPA protocol.
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
              </Tabs>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Device ID"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  required
                  error={!!errors.deviceId}
                  helperText={errors.deviceId || 'Device identifier (MAC or ID)'}
                  placeholder="AA:BB:CC:DD:EE:FF"
                  fullWidth
                />

                <TextField
                  label="Parameter Name"
                  value={parameter}
                  onChange={(e) => setParameter(e.target.value)}
                  required
                  error={!!errors.parameter}
                  helperText={errors.parameter || 'TR-181 data model parameter path'}
                  placeholder="Device.WiFi.SSID.1.SSID"
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
                      helperText={errors.value || 'Parameter value to set'}
                      placeholder="MyWiFiNetwork"
                      fullWidth
                    />
                    <FormControl fullWidth>
                      <InputLabel>Data Type</InputLabel>
                      <Select
                        value={dataType}
                        onChange={(e) => setDataType(e.target.value)}
                        label="Data Type"
                      >
                        <MenuItem value="string">String</MenuItem>
                        <MenuItem value="int">Integer</MenuItem>
                        <MenuItem value="uint">Unsigned Integer</MenuItem>
                        <MenuItem value="boolean">Boolean</MenuItem>
                        <MenuItem value="dateTime">DateTime</MenuItem>
                        <MenuItem value="base64">Base64</MenuItem>
                      </Select>
                      <FormHelperText>Parameter data type</FormHelperText>
                    </FormControl>
                  </>
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
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Parameter</Typography>
                        <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          {results.parameter || parameter}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Value</Typography>
                        <Typography>{results.value || results.newValue || 'N/A'}</Typography>
                      </Box>
                      {results.dataType && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Data Type</Typography>
                            <Typography><Chip label={results.dataType} size="small" /></Typography>
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

export default WebPAPage;
