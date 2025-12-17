import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography, Paper, Box, TextField, Button, Stack, Alert, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery } from 'react-query';
import { listDevices } from '../api';
import {
  snmpGet, snmpSet, snmpWalk,
  webpaGetParameter, webpaSetParameter, webpaGetParameterNames,
  tr069GetParameterValues, tr069SetParameterValues, tr069Reboot,
  tr369Get, tr369Set, tr369Operate
} from '../api';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../store/uiSlice';

// PUBLIC_INTERFACE
function ProtocolPlaceholderPage({ title, description }) {
  const params = useParams();
  const dispatch = useDispatch();
  const protocolName = params?.name || '';
  const derivedTitle = title || protocolName.toUpperCase();
  
  const [deviceId, setDeviceId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Fetch devices for selection
  const { data: devicesData } = useQuery(['devices'], () => listDevices({ page: 1, pageSize: 100 }));
  const devices = devicesData?.items || [];

  // Protocol-specific state
  const [snmpOid, setSnmpOid] = React.useState('1.3.6.1.2.1.1.1.0');
  const [snmpValue, setSnmpValue] = React.useState('');
  const [snmpVersion, setSnmpVersion] = React.useState('v2c');
  const [snmpCommunity, setSnmpCommunity] = React.useState('public');

  const [webpaParam, setWebpaParam] = React.useState('Device.WiFi.SSID.1.SSID');
  const [webpaValue, setWebpaValue] = React.useState('');

  const [tr069Params, setTr069Params] = React.useState('InternetGatewayDevice.DeviceInfo.Manufacturer');
  const [tr069SetParams, setTr069SetParams] = React.useState('');

  const [tr369Paths, setTr369Paths] = React.useState('Device.WiFi.SSID.1.SSID');
  const [tr369SetValue, setTr369SetValue] = React.useState('');
  const [tr369Command, setTr369Command] = React.useState('Device.Reboot()');

  const executeOperation = async (operation, params) => {
    if (!deviceId) {
      dispatch(showSnackbar({ message: 'Please select a device', severity: 'warning' }));
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await operation(params);
      setResult(res);
      dispatch(showSnackbar({ message: 'Operation completed successfully', severity: 'success' }));
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err.message || 'Operation failed';
      setError(msg);
      dispatch(showSnackbar({ message: msg, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const renderSNMPOperations = () => (
    <Stack spacing={2}>
      <FormControl fullWidth>
        <InputLabel>Device</InputLabel>
        <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} label="Device">
          <MenuItem value=""><em>Select Device</em></MenuItem>
          {devices.map(d => <MenuItem key={d.id} value={d.id}>{d.name} ({d.ip})</MenuItem>)}
        </Select>
      </FormControl>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>SNMP GET</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField label="OID" value={snmpOid} onChange={(e) => setSnmpOid(e.target.value)} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Version</InputLabel>
              <Select value={snmpVersion} onChange={(e) => setSnmpVersion(e.target.value)} label="Version">
                <MenuItem value="v2c">v2c</MenuItem>
                <MenuItem value="v3">v3</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Community" value={snmpCommunity} onChange={(e) => setSnmpCommunity(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() => executeOperation(snmpGet, { deviceId, oid: snmpOid, version: snmpVersion, community: snmpCommunity })}
              disabled={loading}
            >
              Execute GET
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>SNMP SET</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField label="OID" value={snmpOid} onChange={(e) => setSnmpOid(e.target.value)} fullWidth />
            <TextField label="Value" value={snmpValue} onChange={(e) => setSnmpValue(e.target.value)} fullWidth />
            <TextField label="Community" value={snmpCommunity} onChange={(e) => setSnmpCommunity(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() => executeOperation(snmpSet, {
                deviceId, oid: snmpOid, value: snmpValue, valueType: 'OctetString', version: snmpVersion, community: snmpCommunity
              })}
              disabled={loading}
            >
              Execute SET
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>SNMP WALK</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField label="Starting OID" value={snmpOid} onChange={(e) => setSnmpOid(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() => executeOperation(snmpWalk, { deviceId, oid: snmpOid, version: snmpVersion, community: snmpCommunity })}
              disabled={loading}
            >
              Execute WALK
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );

  const renderWebPAOperations = () => (
    <Stack spacing={2}>
      <FormControl fullWidth>
        <InputLabel>Device</InputLabel>
        <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} label="Device">
          <MenuItem value=""><em>Select Device</em></MenuItem>
          {devices.map(d => <MenuItem key={d.id} value={d.id}>{d.name} ({d.ip})</MenuItem>)}
        </Select>
      </FormControl>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>WebPA GET Parameter</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField label="Parameter" value={webpaParam} onChange={(e) => setWebpaParam(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() => executeOperation(webpaGetParameter, { deviceId, parameter: webpaParam })}
              disabled={loading}
            >
              Get Parameter
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>WebPA SET Parameter</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField label="Parameter" value={webpaParam} onChange={(e) => setWebpaParam(e.target.value)} fullWidth />
            <TextField label="Value" value={webpaValue} onChange={(e) => setWebpaValue(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() => executeOperation(webpaSetParameter, { deviceId, parameter: webpaParam, value: webpaValue, dataType: 'string' })}
              disabled={loading}
            >
              Set Parameter
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>WebPA GET Parameter Names</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField label="Path" value={webpaParam} onChange={(e) => setWebpaParam(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() => executeOperation(webpaGetParameterNames, { deviceId, path: webpaParam, nextLevel: false })}
              disabled={loading}
            >
              Get Parameter Names
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );

  const renderTR069Operations = () => (
    <Stack spacing={2}>
      <FormControl fullWidth>
        <InputLabel>Device</InputLabel>
        <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} label="Device">
          <MenuItem value=""><em>Select Device</em></MenuItem>
          {devices.map(d => <MenuItem key={d.id} value={d.id}>{d.name} ({d.ip})</MenuItem>)}
        </Select>
      </FormControl>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>TR-069 GET Parameter Values</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              label="Parameters (comma-separated)"
              value={tr069Params}
              onChange={(e) => setTr069Params(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <Button
              variant="contained"
              onClick={() => executeOperation(tr069GetParameterValues, {
                deviceId,
                parameters: tr069Params.split(',').map(p => p.trim()).filter(Boolean)
              })}
              disabled={loading}
            >
              Get Parameters
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>TR-069 SET Parameter Values</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              label="Parameters JSON (e.g., [{name: 'param', value: 'val', type: 'string'}])"
              value={tr069SetParams}
              onChange={(e) => setTr069SetParams(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <Button
              variant="contained"
              onClick={() => {
                try {
                  const params = JSON.parse(tr069SetParams);
                  executeOperation(tr069SetParameterValues, { deviceId, parameters: params });
                } catch (e) {
                  dispatch(showSnackbar({ message: 'Invalid JSON format', severity: 'error' }));
                }
              }}
              disabled={loading}
            >
              Set Parameters
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>TR-069 Reboot</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Button
              variant="contained"
              color="warning"
              onClick={() => executeOperation(tr069Reboot, { deviceId })}
              disabled={loading}
            >
              Reboot Device
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );

  const renderTR369Operations = () => (
    <Stack spacing={2}>
      <FormControl fullWidth>
        <InputLabel>Device</InputLabel>
        <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} label="Device">
          <MenuItem value=""><em>Select Device</em></MenuItem>
          {devices.map(d => <MenuItem key={d.id} value={d.id}>{d.name} ({d.ip})</MenuItem>)}
        </Select>
      </FormControl>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>TR-369 GET</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              label="Paths (comma-separated)"
              value={tr369Paths}
              onChange={(e) => setTr369Paths(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <Button
              variant="contained"
              onClick={() => executeOperation(tr369Get, {
                deviceId,
                paths: tr369Paths.split(',').map(p => p.trim()).filter(Boolean)
              })}
              disabled={loading}
            >
              Execute GET
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>TR-369 SET</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField label="Path" value={tr369Paths} onChange={(e) => setTr369Paths(e.target.value)} fullWidth />
            <TextField label="Value" value={tr369SetValue} onChange={(e) => setTr369SetValue(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() => executeOperation(tr369Set, {
                deviceId,
                parameters: [{ path: tr369Paths, value: tr369SetValue, required: true }]
              })}
              disabled={loading}
            >
              Execute SET
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>TR-369 OPERATE</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField label="Command" value={tr369Command} onChange={(e) => setTr369Command(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() => executeOperation(tr369Operate, {
                deviceId,
                command: tr369Command,
                commandKey: `cmd-${Date.now()}`,
                inputArgs: {}
              })}
              disabled={loading}
            >
              Execute Command
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );

  const renderOperations = () => {
    switch (protocolName.toLowerCase()) {
      case 'snmp':
        return renderSNMPOperations();
      case 'webpa':
        return renderWebPAOperations();
      case 'tr69':
        return renderTR069Operations();
      case 'tr369':
        return renderTR369Operations();
      default:
        return (
          <Typography variant="body1">
            {description || 'Protocol operations will be implemented in a future iteration.'}
          </Typography>
        );
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>{derivedTitle}</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {renderOperations()}
      </Paper>

      {loading && (
        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <CircularProgress size={24} />
          <Typography>Executing operation...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>Result</Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 400,
              fontSize: '0.875rem',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default ProtocolPlaceholderPage;
