import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  IconButton,
  Button,
} from '@mui/material';
import { Visibility as ViewIcon, GetApp as DownloadIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { fetchQueryHistory, fetchQueryResults } from '../store/slices/queriesSlice';
import * as exportApi from '../api/export';

// PUBLIC_INTERFACE
/**
 * Query History page component
 * Displays historical queries with view and export functionality
 */
const QueryHistory = () => {
  const dispatch = useDispatch();
  const { history, pagination, loading } = useSelector((state) => state.queries);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [exportLoading, setExportLoading] = useState(null);

  useEffect(() => {
    dispatch(fetchQueryHistory({ page: page + 1, pageSize: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewResults = async (jobId) => {
    const result = await dispatch(fetchQueryResults(jobId));
    if (fetchQueryResults.fulfilled.match(result)) {
      setSelectedQuery(result.payload);
    }
  };

  const handleExport = async (jobId, format) => {
    setExportLoading(jobId);
    try {
      let blob;
      if (format === 'csv') {
        blob = await exportApi.exportResultsAsCSV(jobId);
        saveAs(blob, `query-${jobId}.csv`);
      } else {
        blob = await exportApi.exportResultsAsJSON(jobId);
        saveAs(blob, `query-${jobId}.json`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
      case 'running':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && history.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Query History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Protocol</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((query) => (
              <TableRow key={query.id || query.jobId}>
                <TableCell>{query.jobId}</TableCell>
                <TableCell>
                  <Chip label={query.protocol} size="small" color="primary" />
                </TableCell>
                <TableCell>{query.operation}</TableCell>
                <TableCell>{query.deviceName || query.deviceId}</TableCell>
                <TableCell>
                  <Chip
                    label={query.status}
                    size="small"
                    color={getStatusColor(query.status)}
                  />
                </TableCell>
                <TableCell>
                  {query.timestamp
                    ? format(new Date(query.timestamp), 'MMM dd, yyyy HH:mm:ss')
                    : 'N/A'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleViewResults(query.jobId)}
                    title="View Results"
                  >
                    <ViewIcon />
                  </IconButton>
                  <Button
                    size="small"
                    startIcon={exportLoading === query.jobId ? <CircularProgress size={16} /> : <DownloadIcon />}
                    onClick={() => handleExport(query.jobId, 'csv')}
                    disabled={exportLoading === query.jobId || query.status !== 'completed'}
                    sx={{ ml: 1 }}
                  >
                    CSV
                  </Button>
                  <Button
                    size="small"
                    startIcon={exportLoading === query.jobId ? <CircularProgress size={16} /> : <DownloadIcon />}
                    onClick={() => handleExport(query.jobId, 'json')}
                    disabled={exportLoading === query.jobId || query.status !== 'completed'}
                    sx={{ ml: 1 }}
                  >
                    JSON
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {history.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No query history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {selectedQuery && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Query Results
          </Typography>
          <pre style={{ overflow: 'auto', maxHeight: '400px' }}>
            {JSON.stringify(selectedQuery, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default QueryHistory;
