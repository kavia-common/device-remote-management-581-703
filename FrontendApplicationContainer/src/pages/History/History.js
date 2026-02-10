import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { historyApi } from '../../services/api';

// PUBLIC_INTERFACE
const History = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch query history
  const { data: historyData, isLoading, error, refetch } = useQuery({
    queryKey: ['queryHistory', page, rowsPerPage, searchTerm],
    queryFn: () => historyApi.getQueryHistory({
      page: page + 1,
      pageSize: rowsPerPage,
      search: searchTerm,
    }),
  });

  // Delete query mutation
  const deleteQueryMutation = useMutation({
    mutationFn: historyApi.deleteQueryHistory,
    onSuccess: () => {
      queryClient.invalidateQueries(['queryHistory']);
    },
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDelete = (queryId) => {
    if (window.confirm('Are you sure you want to delete this query from history?')) {
      deleteQueryMutation.mutate(queryId);
    }
  };

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedQuery(null);
  };

  const handleExport = () => {
    // Mock export functionality
    const csvData = queries.map(query => ({
      timestamp: query.timestamp,
      protocol: query.protocol,
      device: query.deviceName,
      parameter: query.parameter,
      status: query.status,
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'query_history.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getProtocolColor = (protocol) => {
    const colors = {
      SNMP: 'primary',
      WebPA: 'secondary',
      TR69: 'success',
      TR369: 'warning',
    };
    return colors[protocol] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Success': 'success',
      'Failed': 'error',
      'Pending': 'warning',
    };
    return colors[status] || 'default';
  };

  // Mock data for demonstration
  const mockQueries = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      protocol: 'SNMP',
      deviceName: 'Router 192.168.1.1',
      parameter: '1.3.6.1.2.1.1.1.0',
      status: 'Success',
      result: { value: 'Cisco Router', type: 'string' },
      executionTime: 1200,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      protocol: 'WebPA',
      deviceName: 'Modem 192.168.1.2',
      parameter: 'Device.DeviceInfo.ModelName',
      status: 'Success',
      result: { value: 'ARRIS SURFboard', type: 'string' },
      executionTime: 800,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      protocol: 'TR69',
      deviceName: 'Gateway 192.168.1.3',
      parameter: 'Device.WiFi.Radio.1.Channel',
      status: 'Failed',
      result: { error: 'Device unreachable' },
      executionTime: 5000,
    },
  ];

  const queries = historyData?.data?.queries || mockQueries;
  const totalQueries = historyData?.data?.total || mockQueries.length;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Query History</Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Export to CSV">
            <IconButton onClick={handleExport}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load query history: {error.message}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box p={2}>
          <TextField
            fullWidth
            placeholder="Search queries..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Parameter/OID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Execution Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queries.map((query) => (
                <TableRow key={query.id}>
                  <TableCell>
                    {new Date(query.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={query.protocol}
                      color={getProtocolColor(query.protocol)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{query.deviceName}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {query.parameter}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={query.status}
                      color={getStatusColor(query.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{query.executionTime}ms</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewQuery(query)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(query.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalQueries}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Query Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Query Details</DialogTitle>
        <DialogContent>
          {selectedQuery && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" gutterBottom>
                Query Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Timestamp: {new Date(selectedQuery.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Protocol: {selectedQuery.protocol}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Device: {selectedQuery.deviceName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Parameter/OID: {selectedQuery.parameter}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {selectedQuery.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Execution Time: {selectedQuery.executionTime}ms
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Result
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                  {JSON.stringify(selectedQuery.result, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default History;
