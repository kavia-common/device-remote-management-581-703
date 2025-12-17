import React from 'react';
import { useQuery } from 'react-query';
import { listDevices, getDeviceById } from '../api';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Box, IconButton, Tooltip, Stack, Skeleton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Chip, Grid
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import Pagination from '../components/Pagination';
import { exportCSV, exportJSON } from '../utils/exporters';

// PUBLIC_INTERFACE
function DevicesPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sort, setSort] = React.useState('name:asc');
  const [selectedDeviceId, setSelectedDeviceId] = React.useState(null);

  const { data, isLoading, isFetching } = useQuery(
    ['devices', page, pageSize, sort],
    () => listDevices({ page, pageSize, sort }),
    { keepPreviousData: true }
  );

  const { data: deviceDetails } = useQuery(
    ['device', selectedDeviceId],
    () => getDeviceById(selectedDeviceId),
    { enabled: !!selectedDeviceId }
  );

  const handlePageChange = ({ page: p, pageSize: ps }) => {
    if (p != null) setPage(p);
    if (ps != null) setPageSize(ps);
  };

  const toggleSort = (field) => {
    const [curField, dir] = sort.split(':');
    const nextDir = curField === field && dir === 'asc' ? 'desc' : 'asc';
    setSort(`${field}:${nextDir}`);
  };

  const handleCloseDetails = () => setSelectedDeviceId(null);

  const rows = data?.items || [];
  const totalPages = data?.totalPages || 0;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online': return 'success';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Devices</Typography>
        <Box>
          <Tooltip title="Export CSV">
            <IconButton onClick={() => exportCSV(rows, 'devices.csv')} aria-label="Export CSV">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export JSON">
            <IconButton onClick={() => exportJSON(rows, 'devices.json')} aria-label="Export JSON">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="devices table">
          <TableHead>
            <TableRow>
              {[
                { key: 'name', label: 'Name' },
                { key: 'ip', label: 'IP' },
                { key: 'protocol', label: 'Protocol' },
                { key: 'status', label: 'Status' },
                { key: 'createdAt', label: 'Created' },
              ].map((col) => (
                <TableCell key={col.key}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {col.label}
                    <IconButton size="small" onClick={() => toggleSort(col.key)} aria-label={`Sort by ${col.label}`}>
                      <SortIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <TableRow key={`sk-${idx}`}>
                  <TableCell colSpan={6}><Skeleton variant="rectangular" height={24} /></TableCell>
                </TableRow>
              ))
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.ip}</TableCell>
                  <TableCell><Chip label={row.protocol} size="small" /></TableCell>
                  <TableCell>
                    <Chip label={row.status} size="small" color={getStatusColor(row.status)} />
                  </TableCell>
                  <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => setSelectedDeviceId(row.id)} aria-label="View details">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}><Typography align="center">No devices found.</Typography></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination page={page} pageSize={pageSize} totalPages={totalPages} onChange={handlePageChange} />
      {isFetching && <Typography variant="body2" color="text.secondary" mt={1}>Updating...</Typography>}

      {/* Device Details Dialog */}
      <Dialog open={!!selectedDeviceId} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Device Details</DialogTitle>
        <DialogContent>
          {deviceDetails ? (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="subtitle2">ID:</Typography></Grid>
              <Grid item xs={6}><Typography>{deviceDetails.id}</Typography></Grid>
              
              <Grid item xs={6}><Typography variant="subtitle2">Name:</Typography></Grid>
              <Grid item xs={6}><Typography>{deviceDetails.name}</Typography></Grid>
              
              <Grid item xs={6}><Typography variant="subtitle2">IP Address:</Typography></Grid>
              <Grid item xs={6}><Typography>{deviceDetails.ip}</Typography></Grid>
              
              <Grid item xs={6}><Typography variant="subtitle2">Protocol:</Typography></Grid>
              <Grid item xs={6}><Chip label={deviceDetails.protocol} size="small" /></Grid>
              
              <Grid item xs={6}><Typography variant="subtitle2">Status:</Typography></Grid>
              <Grid item xs={6}>
                <Chip label={deviceDetails.status} size="small" color={getStatusColor(deviceDetails.status)} />
              </Grid>
              
              <Grid item xs={6}><Typography variant="subtitle2">Created:</Typography></Grid>
              <Grid item xs={6}><Typography>{new Date(deviceDetails.createdAt).toLocaleString()}</Typography></Grid>
              
              {deviceDetails.details && Object.keys(deviceDetails.details).length > 0 && (
                <>
                  <Grid item xs={12}><Typography variant="h6" mt={2}>Additional Details</Typography></Grid>
                  {Object.entries(deviceDetails.details).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <Grid item xs={6}><Typography variant="subtitle2">{key}:</Typography></Grid>
                      <Grid item xs={6}><Typography>{String(value)}</Typography></Grid>
                    </React.Fragment>
                  ))}
                </>
              )}
            </Grid>
          ) : (
            <Typography>Loading device details...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DevicesPage;
