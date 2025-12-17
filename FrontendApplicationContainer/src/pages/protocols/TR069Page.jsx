import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  LinearProgress,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  tr069GetParameterValues,
  tr069SetParameterValues,
  tr069Reboot,
  tr069Download,
  tr069GetTaskStatus,
} from '../../api/protocols/tr069';
import { showSnackbar } from '../../store/uiSlice';
import { selectUser } from '../../store/authSlice';
import { exportJSON, exportCSV } from '../../utils/exporters';
import { buildQueryRecord, createQueryLog } from '../../api/activity';

const STORAGE_KEY = 'tr069_form_values';

// PUBLIC_INTERFACE
function TR069Page() {
  /**
   * TR-069/ACS Protocol Operations Page
   * Provides UI for TR-069 parameter operations and device tasks
   */
  const dispatch = useDispatch();
  const [operation, setOperation] = useState(0); // 0=GET, 1=SET, 2=TASKS
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [pollingTaskId, setPollingTaskId] = useState(null);

  // Form fields
  const [deviceId, setDeviceId] = useState('');
  const [parameters, setParameters] = useState('');
  const [taskType, setTaskType] = useState('reboot');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileType, setFileType] = useState('1');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Load persisted values
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDeviceId(parsed.deviceId || '');
        setParameters(parsed.parameters || '');
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
        parameters,
      }));
    } catch (err) {
      console.error('Failed to persist form values:', err);
    }
  }, [deviceId, parameters]);

  // Poll task status
  useEffect(() => {
    if (!pollingTaskId) return;

    const interval = setInterval(async () => {
      try {
        const status = await tr069GetTaskStatus({ taskId: pollingTaskId });
        setTaskStatus(status);
        if (status.status === 'completed' || status.status === 'failed') {
          setPollingTaskId(null);
          dispatch(showSnackbar({
            message: `Task ${status.status}`,
            severity: status.status === 'completed' ? 'success' : 'error',
          }));
        }
      } catch (err) {
        console.error('Failed to poll task status:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingTaskId, dispatch]);

  const validate = () => {
    const newErrors = {};
    if (!deviceId.trim()) newErrors.deviceId = 'Device ID is required';
    if (operation < 2 && !parameters.trim()) newErrors.parameters = 'Parameters are required';
    if (operation === 2 && taskType === 'download' && !downloadUrl.trim()) {
      newErrors.downloadUrl = 'Download URL is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseParameters = () => {
    // Parse parameters from textarea
    const lines = parameters.split('\n').filter(l => l.trim());
    if (operation === 0) {
      // GET: just parameter names
      return lines;
    } else {
      // SET: name=value format
      return lines.map(line => {
        const [name, ...valueParts] = line.split('=');
        return {
          name: name.trim(),
          value: valueParts.join('=').trim(),
          type: 'string',
        };
      });
    }
  };

  const user = useSelector(selectUser);

  const handleExecute = async () => {
    if (!validate()) {
      dispatch(showSnackbar({ message: 'Please fix validation errors', severity: 'error' }));
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setTaskStatus(null);

    const startTime = Date.now();
    let result;
    let executionError = null;

    try {
      if (operation === 0) {
        // GET
        const params = parseParameters();
        result = await tr069GetParameterValues({ deviceId, parameters: params });
      } else if (operation === 1) {
        // SET
        const params = parseParameters();
        result = await tr069SetParameterValues({ deviceId, parameters: params });
      } else {
        // TASKS
        if (taskType === 'reboot') {
          result = await tr069Reboot({ deviceId });
        } else if (taskType === 'download') {
          result = await tr069Download({
            deviceId,
            fileType,
            url: downloadUrl,
            username: '',
            password: '',
          });
        }
        
        // Start polling if we got a taskId
        if (result.taskId) {
          setPollingTaskId(result.taskId);
          setTaskStatus(result);
        }
      }
      setResults(result);
      dispatch(showSnackbar({ message: 'Operation initiated successfully', severity: 'success' }));
    } catch (err) {
      executionError = err.response?.data?.error?.message || err.message || 'Operation failed';
      setError(executionError);
      dispatch(showSnackbar({ message: executionError, severity: 'error' }));
    } finally {
      const duration = Date.now() - startTime;
      setLoading(false);

      // Log to query history (non-blocking)
      let operationName, actionName, params;
      if (operation === 0) {
        operationName = 'GET_PARAMETER_VALUES';
        actionName = 'tr069GetParameterValues';
        params = { parameters: parseParameters() };
      } else if (operation === 1) {
        operationName = 'SET_PARAMETER_VALUES';
        actionName = 'tr069SetParameterValues';
        params = { parameters: parseParameters() };
      } else {
        operationName = taskType === 'reboot' ? 'REBOOT' : 'DOWNLOAD';
        actionName = taskType === 'reboot' ? 'tr069Reboot' : 'tr069Download';
        params = taskType === 'reboot' ? {} : { fileType, url: downloadUrl };
      }

      const queryRecord = buildQueryRecord({
        protocol: 'tr069',
        target: deviceId,
        deviceId,
        action: actionName,
        operation: operationName,
        params,
        status: executionError ? 'failed' : 'success',
        duration,
        response: result,
        error: executionError,
        user: user?.email || user?.username || 'unknown',
        requestId: result?.taskId,
      });

      createQueryLog(queryRecord).catch(err => {
        console.warn('Failed to log query to history:', err);
      });
    }
  };

  const handleRefreshTaskStatus = async () => {
    if (!results?.taskId) return;
    try {
      const status = await tr069GetTaskStatus({ taskId: results.taskId });
      setTaskStatus(status);
      dispatch(showSnackbar({ message: 'Task status refreshed', severity: 'info' }));
    } catch (err) {
      dispatch(showSnackbar({ message: 'Failed to refresh status', severity: 'error' }));
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
      rows = results.parameters?.map(p => ({
        name: p.name,
        value: p.value || p.newValue || '',
        type: p.type || '',
        previousValue: p.previousValue || '',
      })) || [];
    } else {
      rows = [{
        taskId: results.taskId,
        status: results.status,
        message: results.message,
      }];
    }
    exportCSV(rows, `tr069_${Date.now()}.csv`);
    dispatch(showSnackbar({ message: 'Exported to CSV', severity: 'success' }));
  };

  const handleExportJSON = () => {
    if (results) {
      exportJSON(results, `tr069_${Date.now()}.json`);
      dispatch(showSnackbar({ message: 'Exported to JSON', severity: 'success' }));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        TR-069/ACS Protocol Operations
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage CPE devices using TR-069 protocol with parameter operations and device management tasks.
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
                <Tab label="TASKS" />
              </Tabs>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="CPE Device ID"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  required
                  error={!!errors.deviceId}
                  helperText={errors.deviceId || 'CPE unique identifier'}
                  placeholder="cpe-001"
                  fullWidth
                />

                {operation < 2 && (
                  <TextField
                    label={operation === 0 ? 'Parameter Names' : 'Parameters (name=value)'}
                    value={parameters}
                    onChange={(e) => setParameters(e.target.value)}
                    required
                    error={!!errors.parameters}
                    helperText={
                      errors.parameters || 
                      (operation === 0 
                        ? 'One parameter per line, e.g., InternetGatewayDevice.DeviceInfo.ModelName'
                        : 'One parameter per line in format: name=value')
                    }
                    placeholder={
                      operation === 0
                        ? 'InternetGatewayDevice.DeviceInfo.Manufacturer\nInternetGatewayDevice.DeviceInfo.ModelName'
                        : 'InternetGatewayDevice.ManagementServer.URL=http://acs.example.com\nInternetGatewayDevice.Time.NTPServer1=pool.ntp.org'
                    }
                    multiline
                    rows={6}
                    fullWidth
                  />
                )}

                {operation === 2 && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>Task Type</InputLabel>
                      <Select
                        value={taskType}
                        onChange={(e) => setTaskType(e.target.value)}
                        label="Task Type"
                      >
                        <MenuItem value="reboot">Reboot</MenuItem>
                        <MenuItem value="download">Download (Firmware/Config)</MenuItem>
                      </Select>
                      <FormHelperText>Device management task to execute</FormHelperText>
                    </FormControl>

                    {taskType === 'download' && (
                      <>
                        <FormControl fullWidth>
                          <InputLabel>File Type</InputLabel>
                          <Select
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            label="File Type"
                          >
                            <MenuItem value="1">1 - Firmware Upgrade Image</MenuItem>
                            <MenuItem value="2">2 - Web Content</MenuItem>
                            <MenuItem value="3">3 - Vendor Configuration File</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Download URL"
                          value={downloadUrl}
                          onChange={(e) => setDownloadUrl(e.target.value)}
                          required
                          error={!!errors.downloadUrl}
                          helperText={errors.downloadUrl || 'URL to download file from'}
                          placeholder="http://example.com/firmware.bin"
                          fullWidth
                        />
                      </>
                    )}
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
                <Box>
                  {operation === 2 && results?.taskId && (
                    <Tooltip title="Refresh Task Status">
                      <IconButton onClick={handleRefreshTaskStatus} size="small">
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {results && (
                    <>
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
                    </>
                  )}
                </Box>
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
                  {operation < 2 ? (
                    // Parameter results
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Parameter</strong></TableCell>
                            <TableCell><strong>Value</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {results.parameters?.map((param, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                {param.name}
                              </TableCell>
                              <TableCell>{param.value || param.newValue || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip label={param.type || 'string'} size="small" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    // Task results
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Task ID</Typography>
                          <Typography sx={{ fontFamily: 'monospace' }}>{results.taskId}</Typography>
                        </Box>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={taskStatus?.status || results.status}
                              color={
                                (taskStatus?.status || results.status) === 'completed' ? 'success' :
                                (taskStatus?.status || results.status) === 'failed' ? 'error' :
                                'warning'
                              }
                            />
                          </Box>
                        </Box>
                        {(taskStatus?.progress || results.progress) != null && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Progress</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                  <LinearProgress variant="determinate" value={taskStatus?.progress || results.progress || 0} />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {`${taskStatus?.progress || results.progress || 0}%`}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </>
                        )}
                        {(taskStatus?.message || results.message) && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Message</Typography>
                              <Typography variant="body2">{taskStatus?.message || results.message}</Typography>
                            </Box>
                          </>
                        )}
                        {pollingTaskId && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            Polling task status every 3 seconds...
                          </Alert>
                        )}
                      </Box>
                    </Paper>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Raw JSON Response</Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 1, maxHeight: 200, overflow: 'auto' }}>
                      <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                        {JSON.stringify(taskStatus || results, null, 2)}
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

export default TR069Page;
