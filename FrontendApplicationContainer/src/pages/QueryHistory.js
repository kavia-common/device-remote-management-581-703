import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import {
  fetchQueryHistory,
  fetchQueryResults,
  fetchFavorites,
  starQuery,
  unstarQuery,
} from '../store/slices/queriesSlice';
import { hasPermission } from '../utils/permissions';
import * as exportApi from '../api/export';
import useToast from '../hooks/useToast';
import useDebouncedValue from '../hooks/useDebouncedValue';

// Memoized query row component for better performance
const QueryRow = React.memo(({ 
  query, 
  isStarred, 
  isStarring, 
  canReadFavorites,
  canWriteFavorites,
  exportLoading,
  onViewResults, 
  onExport, 
  onStarToggle 
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
      case 'running':
        return 'info';
      case 'failed':
      case 'error':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <TableRow>
      {canReadFavorites && (
        <TableCell>
          <Tooltip title={isStarred ? 'Remove from favorites' : 'Add to favorites'}>
            <span>
              <IconButton
                size="small"
                onClick={() => onStarToggle(query)}
                disabled={!canWriteFavorites || isStarring}
                color={isStarred ? 'primary' : 'default'}
              >
                {isStarring ? (
                  <CircularProgress size={20} />
                ) : isStarred ? (
                  <StarIcon />
                ) : (
                  <StarBorderIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      )}
      <TableCell>{query.jobId}</TableCell>
      <TableCell>
        <Chip label={query.protocol} size="small" color="primary" />
      </TableCell>
      <TableCell>{query.operation}</TableCell>
      <TableCell>{query.deviceName || query.deviceId}</TableCell>
      <TableCell>
        <Chip label={query.status} size="small" color={getStatusColor(query.status)} />
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
          onClick={() => onViewResults(query.jobId)}
          title="View Results"
        >
          <ViewIcon />
        </IconButton>
        <Button
          size="small"
          startIcon={
            exportLoading === query.jobId ? <CircularProgress size={16} /> : <DownloadIcon />
          }
          onClick={() => onExport(query.jobId, 'csv')}
          disabled={exportLoading === query.jobId || query.status !== 'completed'}
          sx={{ ml: 1 }}
        >
          CSV
        </Button>
        <Button
          size="small"
          startIcon={
            exportLoading === query.jobId ? <CircularProgress size={16} /> : <DownloadIcon />
          }
          onClick={() => onExport(query.jobId, 'json')}
          disabled={exportLoading === query.jobId || query.status !== 'completed'}
          sx={{ ml: 1 }}
        >
          JSON
        </Button>
      </TableCell>
    </TableRow>
  );
});

QueryRow.displayName = 'QueryRow';

// PUBLIC_INTERFACE
/**
 * Query History page component
 * Displays historical queries with view, export, and favorite functionality
 * Uses toast notifications for success and error messages
 * Implements debounced search for better performance
 */
const QueryHistory = () => {
  const dispatch = useDispatch();
  const { history, pagination, loading, favoritesByJobId } = useSelector(
    (state) => state.queries
  );
  const { user } = useSelector((state) => state.auth);
  const userPermissions = user?.permissions || [];
  const { showToast } = useToast();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [exportLoading, setExportLoading] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' or 'favorites'
  const [starringQueries, setStarringQueries] = useState({});

  // Check permissions
  const canReadFavorites = hasPermission(userPermissions, 'queries:favorites:read');
  const canWriteFavorites = hasPermission(userPermissions, 'queries:favorites:write');

  // Debounce search term with 300ms delay for responsive typing
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Fetch data when debounced search term, page, or rowsPerPage changes
  useEffect(() => {
    const params = { 
      page: page + 1, 
      pageSize: rowsPerPage,
    };
    
    // Add search parameter if search term is present
    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }
    
    dispatch(fetchQueryHistory(params));
    
    if (canReadFavorites) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, page, rowsPerPage, debouncedSearchTerm, canReadFavorites]);

  // Memoized handlers
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(0);
    }
  }, []);

  const handleViewResults = useCallback(async (jobId) => {
    const result = await dispatch(fetchQueryResults(jobId));
    if (fetchQueryResults.fulfilled.match(result)) {
      setSelectedQuery(result.payload);
      showToast('Query results loaded', { type: 'success' });
    } else {
      showToast('Failed to load query results', { type: 'error' });
    }
  }, [dispatch, showToast]);

  const handleExport = useCallback(async (jobId, format) => {
    setExportLoading(jobId);
    try {
      let blob;
      if (format === 'csv') {
        blob = await exportApi.exportResultsAsCSV(jobId);
        saveAs(blob, `query-${jobId}.csv`);
        showToast('Results exported as CSV', { type: 'success' });
      } else {
        blob = await exportApi.exportResultsAsJSON(jobId);
        saveAs(blob, `query-${jobId}.json`);
        showToast('Results exported as JSON', { type: 'success' });
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Export failed', { type: 'error' });
    } finally {
      setExportLoading(null);
    }
  }, [showToast]);

  const handleStarToggle = useCallback(async (query) => {
    if (!canWriteFavorites) {
      showToast('You do not have permission to manage favorites', { type: 'error' });
      return;
    }

    const jobId = query.jobId;
    const isStarred = query.isStarred || !!favoritesByJobId[jobId];

    setStarringQueries((prev) => ({ ...prev, [jobId]: true }));

    try {
      if (isStarred) {
        await dispatch(unstarQuery(jobId)).unwrap();
        showToast('Removed from favorites', { type: 'success' });
      } else {
        // Create a favorite from this query
        await dispatch(
          starQuery({
            jobId,
            data: {
              name: `${query.protocol} ${query.operation} - ${
                query.deviceName || query.deviceId
              }`,
              description: `Starred from history on ${format(new Date(), 'MMM dd, yyyy')}`,
            },
          })
        ).unwrap();
        showToast('Added to favorites', { type: 'success' });
      }
    } catch (error) {
      showToast(error.message || 'Failed to toggle favorite', { type: 'error' });
    } finally {
      setStarringQueries((prev) => ({ ...prev, [jobId]: false }));
    }
  }, [canWriteFavorites, favoritesByJobId, dispatch, showToast]);

  // Memoize filtered history based on search and favorites filter
  const filteredHistory = useMemo(() => {
    let filtered = history || [];
    
    // Apply favorites filter
    if (filter === 'favorites') {
      filtered = filtered.filter((query) => {
        return query.isStarred || !!favoritesByJobId[query.jobId];
      });
    }
    
    return filtered;
  }, [history, filter, favoritesByJobId]);

  if (loading && history.length === 0) {
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
        {canReadFavorites && (
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            aria-label="query filter"
            size="small"
          >
            <ToggleButton value="all" aria-label="all queries">
              All
            </ToggleButton>
            <ToggleButton value="favorites" aria-label="favorite queries">
              <StarIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Favorites
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {/* Search bar */}
      <Box mb={2}>
        <TextField
          fullWidth
          placeholder="Search queries by job ID, protocol, operation, or device..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                  aria-label="clear search"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {canReadFavorites && <TableCell width={50}></TableCell>}
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
            {filteredHistory.map((query) => {
              const isStarred = query.isStarred || !!favoritesByJobId[query.jobId];
              const isStarring = starringQueries[query.jobId];

              return (
                <QueryRow
                  key={query.id || query.jobId}
                  query={query}
                  isStarred={isStarred}
                  isStarring={isStarring}
                  canReadFavorites={canReadFavorites}
                  canWriteFavorites={canWriteFavorites}
                  exportLoading={exportLoading}
                  onViewResults={handleViewResults}
                  onExport={handleExport}
                  onStarToggle={handleStarToggle}
                />
              );
            })}
            {filteredHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={canReadFavorites ? 8 : 7} align="center">
                  {searchTerm
                    ? `No queries found matching "${searchTerm}"`
                    : filter === 'favorites'
                    ? 'No favorite queries found'
                    : 'No query history found'}
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
