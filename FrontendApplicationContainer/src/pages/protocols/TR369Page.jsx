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
import {
  tr369Get,
  tr369Set,
  tr369Add,
  tr369Delete,
  tr369Operate,
} from '../../api/protocols/tr369';
import { showSnackbar } from '../../store/uiSlice';
import { exportJSON, exportCSV } from '../../utils/exporters';

const STORAGE_KEY = 'tr369_form_values';

// PUBLIC_INTERFACE
function TR369Page() {
  /**
   * TR-369/USP Protocol Operations Page
   * Provides UI for TR-369 User Services Platform operations
   */
  const dispatch = useDispatch();
  const [operation, setOperation] = useState(0); // 0=GET, 1=SET, 2=ADD, 3=DELETE, 4=OPERATE
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Form fields
  const [deviceId, setDeviceId] = useState('');
  const [paths, setPaths] = useState('');
  const [parameters, setParameters] = useState('');
  const [command, setCommand] = useState('');
  const [commandKey, setCommandKey] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Load persisted values
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDeviceId(parsed.deviceId || '');
        setPaths(parsed.paths || '');
      }
    } catch (err) {
      console.error('Failed to load persisted form values:', err);
    }
  }, []);

  // Persist values
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        deviceId,
        paths,
      }));
    } catch (err) {
      console.error('Failed to persist form values:', err);
    }
  }, [deviceId, paths]);

  const validate = () => {
    const newErrors = {};
    if (!deviceId.trim()) newErrors.deviceId = 'Device ID is required';
    if (operation < 4 && !paths.trim()) newErrors.paths = 'Paths are required';
    if (operation === 1 && !parameters.trim()) newErrors.parameters = 'Parameters are required for SET';
    if (operation === 4) {
      if (!command.trim()) newErrors.command = 'Command is required';
      if (!commandKey.trim()) newErrors.commandKey = 'Command key is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parsePaths = () => {
    return paths.split('\n').filter(l => l.trim());
  };

  const parseParameters = () => {
    const lines = parameters.split('\n').filter(l => l.trim());
    if (operation === 1) {
      // SET: path=value format
      return lines.map(line => {
        const [path, ...valueParts] = line.split('=');
        return {
          path: path.trim(),
          value: valueParts.join('=').trim(),
          required: true,
        };
      });
    } else if (operation === 2) {
      // ADD: parameters as key=value
      const params = {};
      lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        params[key.trim()] = valueParts.join('=').trim();
      });
      return params;
    }
    return {};
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
        const pathList = parsePaths();
        result = await tr369Get({ deviceId, paths: pathList });
      } else if (operation === 1) {
        // SET
        const params = parseParameters();
        result = await tr369Set({ deviceId, parameters: params });
      } else if (operation === 2) {
        // ADD
        const pathList = parsePaths();
        const params = parseParameters();
        result = await tr369Add({ deviceId, path: pathList[0], parameters: params });
      } else if (operation === 3) {
        // DELETE
        const pathList = parsePaths();
        result = await tr369Delete({ deviceId, paths: pathList });
      } else if (operation === 4) {
        // OPERATE
        result = await tr369Operate({
          deviceId,
          command,
          commandKey,
          inputArgs: {},
        });
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
    if (operation === 0 || operation === 1) {
      rows = results.results?.map(r => ({
        path: r.path,
        value: r.value || r.newValue || '',
        type: r.type || '',
        status: r.status || '',
      })) || [];
    } else if (operation === 3) {
      rows = results.results?.map(r => ({
        path: r.path,
        status: r.status,
      })) || [];
    } else {
      rows = [{ result: JSON.stringify(results) }];
    }
    exportCSV(rows, `tr369_${Date.now()}.csv`);
    dispatch(showSnackbar({ message: 'Exported to CSV', severity: 'success' }));
  };

  const handleExportJSON = () => {
    if (results) {
      exportJSON(results, `tr369_${Date.now()}.json`);
      dispatch(showSnackbar({ message: 'Exported to JSON', severity: 'success' }));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        TR-369/USP Protocol Operations
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage devices using the User Services Platform (USP) with comprehensive data model operations.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operation
              </Typography>
              <Tabs
                value={operation}
                onChange={(e, v) => setOperation(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3 }}
              >
                <Tab label="GET" />
                <Tab label="SET" />
                <Tab label="ADD" />
                <Tab label="DELETE" />
                <Tab label="OPERATE" />
              </Tabs>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Device ID"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  required
                  error={!!errors.deviceId}
                  helperText={errors.deviceId || 'USP endpoint identifier'}
                  placeholder="device-001"
                  fullWidth
                />

                {operation < 4 && (
                  <TextField
                    label={operation === 2 ? 'Object Path' : 'Parameter Paths'}
                    value={paths}
                    onChange={(e) => setPaths(e.target.value)}
                    required
                    error={!!errors.paths}
                    helperText={
                      errors.paths ||
                      (operation === 2
                        ? 'Object path for creating new instance'
                        : operation === 3
                        ? 'One object instance path per line to delete'
                        : 'One parameter path per line')
                    }
                    placeholder={
                      operation === 0
                        ? 'Device.WiFi.SSID.1.\nDevice.WiFi.Radio.1.Channel'
                        : operation === 1
                        ? 'Device.WiFi.SSID.1.SSID\nDevice.WiFi.SSID.1.Enable'
                        : operation === 2
                        ? 'Device.WiFi.SSID.'
                        : 'Device.WiFi.SSID.3.'
                    }
                    multiline
                    rows={operation === 2 ? 1 : 4}
                    fullWidth
                  />
                )}

                {(operation === 1 || operation === 2) && (
                  <TextField
                    label={operation === 1 ? 'Parameters (path=value)' : 'Initial Parameters (key=value)'}
                    value={parameters}
                    onChange={(e) => setParameters(e.target.value)}
                    required={operation === 1}
                    error={!!errors.parameters}
                    helperText={
                      errors.parameters ||
                      (operation === 1
                        ? 'One parameter per line: path=value'
                        : 'Optional initial values for new instance')
                    }
                    placeholder={
                      operation === 1
                        ? 'Device.WiFi.SSID.1.SSID=MyNetwork\nDevice.WiFi.SSID.1.Enable=true'
                        : 'SSID=NewNetwork\nEnable=true'
                    }
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}

                {operation === 4 && (
                  <>
                    <TextField
                      label="Command"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      required
                      error={!!errors.command}
                      helperText={errors.command || 'Command path to execute'}
                      placeholder="Device.Reboot()"
                      fullWidth
                    />
                    <TextField
                      label="Command Key"
                      value={commandKey}
                      onChange={(e) => setCommandKey(e.target.value)}
                      required
                      error={!!errors.commandKey}
                      helperText={errors.commandKey || 'Unique identifier for this command'}
                      placeholder={`cmd-${Date.now()}`}
                      fullWidth
                    />
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
                  {(operation === 0 || operation === 1) && results.results ? (
                    // GET/SET results table
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Path</strong></TableCell>
                            <TableCell><strong>Value</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {results.results.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                {item.path}
                              </TableCell>
                              <TableCell>{item.value || item.newValue || 'N/A'}</TableCell>
                              <TableCell>
                                {item.status && <Chip label={item.status} size="small" color={item.status === 'success' ? 'success' : 'default'} />}
                                {item.type && <Chip label={item.type} size="small" />}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : operation === 2 ? (
                    // ADD result
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Object Path</Typography>
                          <Typography sx={{ fontFamily: 'monospace' }}>{results.path}</Typography>
                        </Box>
                        {results.instancePath && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Created Instance Path</Typography>
                              <Typography sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                                {results.instancePath}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Paper>
                  ) : operation === 3 && results.results ? (
                    // DELETE results
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Path</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {results.results.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                {item.path}
                              </TableCell>
                              <TableCell>
                                <Chip label={item.status} size="small" color={item.status === 'deleted' ? 'success' : 'default'} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : operation === 4 ? (
                    // OPERATE result
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Command</Typography>
                          <Typography sx={{ fontFamily: 'monospace' }}>{results.command}</Typography>
                        </Box>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Command Key</Typography>
                          <Typography sx={{ fontFamily: 'monospace' }}>{results.commandKey}</Typography>
                        </Box>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Chip
                            label={results.status}
                            size="small"
                            color={results.status === 'completed' ? 'success' : 'default'}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  ) : null}

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

export default TR369Page;
