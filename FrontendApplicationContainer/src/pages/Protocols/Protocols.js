import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Router as RouterIcon,
  NetworkCheck as NetworkIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { protocolApi } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`protocol-tabpanel-${index}`}
      aria-labelledby={`protocol-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// PUBLIC_INTERFACE
const Protocols = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [snmpOid, setSnmpOid] = useState('');
  const [webpaParameter, setWebpaParameter] = useState('');
  const [tr69Parameter, setTr69Parameter] = useState('');
  const [tr369Parameter, setTr369Parameter] = useState('');
  const [results, setResults] = useState(null);

  // Mock devices for demonstration
  const mockDevices = [
    { id: '1', name: 'Router 192.168.1.1', protocol: 'SNMP' },
    { id: '2', name: 'Modem 192.168.1.2', protocol: 'WebPA' },
    { id: '3', name: 'Gateway 192.168.1.3', protocol: 'TR69' },
    { id: '4', name: 'CPE 192.168.1.4', protocol: 'TR369' },
  ];

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setResults(null);
  };

  // SNMP Query Mutation
  const snmpMutation = useMutation({
    mutationFn: ({ deviceId, oid }) => protocolApi.getSnmpData(deviceId, oid),
    onSuccess: (data) => {
      setResults(data.data);
    },
  });

  // WebPA Query Mutation
  const webpaMutation = useMutation({
    mutationFn: ({ deviceId, parameter }) => protocolApi.getWebpaData(deviceId, parameter),
    onSuccess: (data) => {
      setResults(data.data);
    },
  });

  // TR69 Query Mutation
  const tr69Mutation = useMutation({
    mutationFn: ({ deviceId, parameter }) => protocolApi.getTr69Data(deviceId, parameter),
    onSuccess: (data) => {
      setResults(data.data);
    },
  });

  // TR369 Query Mutation
  const tr369Mutation = useMutation({
    mutationFn: ({ deviceId, parameter }) => protocolApi.getTr369Data(deviceId, parameter),
    onSuccess: (data) => {
      setResults(data.data);
    },
  });

  const handleSnmpQuery = () => {
    if (selectedDevice && snmpOid) {
      snmpMutation.mutate({ deviceId: selectedDevice, oid: snmpOid });
    }
  };

  const handleWebpaQuery = () => {
    if (selectedDevice && webpaParameter) {
      webpaMutation.mutate({ deviceId: selectedDevice, parameter: webpaParameter });
    }
  };

  const handleTr69Query = () => {
    if (selectedDevice && tr69Parameter) {
      tr69Mutation.mutate({ deviceId: selectedDevice, parameter: tr69Parameter });
    }
  };

  const handleTr369Query = () => {
    if (selectedDevice && tr369Parameter) {
      tr369Mutation.mutate({ deviceId: selectedDevice, parameter: tr369Parameter });
    }
  };

  const getCurrentMutation = () => {
    switch (currentTab) {
      case 0: return snmpMutation;
      case 1: return webpaMutation;
      case 2: return tr69Mutation;
      case 3: return tr369Mutation;
      default: return null;
    }
  };

  const currentMutation = getCurrentMutation();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Protocol Operations
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="SNMP" icon={<RouterIcon />} iconPosition="start" />
            <Tab label="WebPA" icon={<NetworkIcon />} iconPosition="start" />
            <Tab label="TR69/ACS" icon={<SettingsIcon />} iconPosition="start" />
            <Tab label="TR369/USP" icon={<SettingsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SNMP Query
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Device</InputLabel>
                      <Select
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                      >
                        {mockDevices
                          .filter(d => d.protocol === 'SNMP')
                          .map((device) => (
                            <MenuItem key={device.id} value={device.id}>
                              {device.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="OID"
                      value={snmpOid}
                      onChange={(e) => setSnmpOid(e.target.value)}
                      placeholder="1.3.6.1.2.1.1.1.0"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={handleSnmpQuery}
                      disabled={!selectedDevice || !snmpOid || snmpMutation.isPending}
                      startIcon={snmpMutation.isPending ? <CircularProgress size={20} /> : <SendIcon />}
                    >
                      Execute Query
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              {results && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Query Results
                    </Typography>
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    WebPA Query
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Device</InputLabel>
                      <Select
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                      >
                        {mockDevices
                          .filter(d => d.protocol === 'WebPA')
                          .map((device) => (
                            <MenuItem key={device.id} value={device.id}>
                              {device.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Parameter"
                      value={webpaParameter}
                      onChange={(e) => setWebpaParameter(e.target.value)}
                      placeholder="Device.DeviceInfo.ModelName"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={handleWebpaQuery}
                      disabled={!selectedDevice || !webpaParameter || webpaMutation.isPending}
                      startIcon={webpaMutation.isPending ? <CircularProgress size={20} /> : <SendIcon />}
                    >
                      Execute Query
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              {results && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Query Results
                    </Typography>
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    TR69/ACS Query
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Device</InputLabel>
                      <Select
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                      >
                        {mockDevices
                          .filter(d => d.protocol === 'TR69')
                          .map((device) => (
                            <MenuItem key={device.id} value={device.id}>
                              {device.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="TR-181 Parameter"
                      value={tr69Parameter}
                      onChange={(e) => setTr69Parameter(e.target.value)}
                      placeholder="Device.DeviceInfo.ModelName"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={handleTr69Query}
                      disabled={!selectedDevice || !tr69Parameter || tr69Mutation.isPending}
                      startIcon={tr69Mutation.isPending ? <CircularProgress size={20} /> : <SendIcon />}
                    >
                      Execute Query
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              {results && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Query Results
                    </Typography>
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    TR369/USP Query
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Device</InputLabel>
                      <Select
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                      >
                        {mockDevices
                          .filter(d => d.protocol === 'TR369')
                          .map((device) => (
                            <MenuItem key={device.id} value={device.id}>
                              {device.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="USP Parameter"
                      value={tr369Parameter}
                      onChange={(e) => setTr369Parameter(e.target.value)}
                      placeholder="Device.DeviceInfo.ModelName"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={handleTr369Query}
                      disabled={!selectedDevice || !tr369Parameter || tr369Mutation.isPending}
                      startIcon={tr369Mutation.isPending ? <CircularProgress size={20} /> : <SendIcon />}
                    >
                      Execute Query
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              {results && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Query Results
                    </Typography>
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {currentMutation?.isError && (
          <Alert severity="error" sx={{ m: 3 }}>
            Query failed: {currentMutation.error?.message || 'Unknown error'}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default Protocols;
