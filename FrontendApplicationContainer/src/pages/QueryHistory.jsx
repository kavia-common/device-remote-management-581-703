import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Menu,
  MenuItem as MenuItemOption,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  GetApp as GetAppIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { getQueryHistory, toggleFavorite, listQueries } from '../api/queries';
import { exportResults } from '../api/exports';
import { exportCSV } from '../utils/exporters';
import Pagination from '../components/Pagination';
import QueryDetailsDialog from '../components/QueryDetailsDialog';

// PUBLIC_INTERFACE
function QueryHistory() {
  /**
   * Query history page showing past protocol/device queries with filters, pagination, and favorites.
   */
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State from URL query params
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize')) || 20);
  const [sortField, setSortField] = useState(searchParams.get('sortField') || 'executedAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [protocolFilter, setProtocolFilter] = useState(searchParams.get('protocol') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [activeTab, setActiveTab] = useState(parseInt(searchParams.get('tab')) || 0);
  
  // Dialogs & menus
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuQuery, setMenuQuery] = useState(null);

  // Sync state to URL
  useEffect(() => {
    const params = {};
    if (page !== 1) params.page = page;
    if (pageSize !== 20) params.pageSize = pageSize;
    if (sortField !== 'executedAt') params.sortField = sortField;
    if (sortOrder !== 'desc') params.sortOrder = sortOrder;
    if (protocolFilter) params.protocol = protocolFilter;
    if (statusFilter) params.status = statusFilter;
    if (searchText) params.search = searchText;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (activeTab !== 0) params.tab = activeTab;
    setSearchParams(params);
  }, [page, pageSize, sortField, sortOrder, protocolFilter, statusFilter, searchText, dateFrom, dateTo, activeTab, setSearchParams]);

  // Fetch data based on tab
  const isFavoritesTab = activeTab === 1;
  
  const { data: historyData, isLoading: historyLoading, error: historyError, refetch: refetchHistory } = useQuery(
    ['queryHistory', page, pageSize, sortField, sortOrder, protocolFilter, statusFilter, searchText, dateFrom, dateTo],
    () => getQueryHistory({
      page,
      pageSize,
      sort: `${sortField}:${sortOrder}`,
      protocol: protocolFilter || undefined,
      status: statusFilter || undefined,
      search: searchText || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    { enabled: !isFavoritesTab, keepPreviousData: true }
  );

  const { data: favoritesData, isLoading: favoritesLoading, error: favoritesError, refetch: refetchFavorites } = useQuery(
    ['favorites', page, pageSize],
    () => listQueries({ page, pageSize, favorites: true }),
    { enabled: isFavoritesTab, keepPreviousData: true }
  );

  const currentData = isFavoritesTab ? favoritesData : historyData;
  const isLoading = isFavoritesTab ? favoritesLoading : historyLoading;
  const error = isFavoritesTab ? favoritesError : historyError;

  const handleRefresh = () => {
    if (isFavoritesTab) {
      refetchFavorites();
    } else {
      refetchHistory();
    }
  };

  const handlePaginationChange = ({ page: newPage, pageSize: newPageSize }) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1); // Reset to first page on tab change
  };

  const handleViewDetails = (query) => {
    setSelectedQuery(query);
    setDetailsDialogOpen(true);
  };

  const handleToggleFavorite = async (queryId, currentStatus) => {
    try {
      await toggleFavorite(queryId, !currentStatus);
      handleRefresh();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleRerun = (query) => {
    // Navigate to appropriate protocol page with pre-filled params
    const protocolPath = `/protocols/${query.protocol}`;
    navigate(protocolPath, { state: { rerunQuery: query } });
  };

  const handleExportQuery = async (query) => {
    try {
      const exportData = [{
        id: query.id,
        time: query.executedAt,
        user: query.user || 'N/A',
        protocol: query.protocol,
        target: query.deviceId || query.target,
        action: query.operation || query.action,
        parameters: JSON.stringify(query.parameters || {}),
        status: query.status,
        duration: query.duration ? `${query.duration}ms` : 'N/A',
      }];
      await exportResults({
        format: 'json',
        data: query,
        filename: `query-${query.id}.json`,
      });
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleExportPage = () => {
    const items = currentData?.items || [];
    const exportData = items.map(q => ({
      id: q.id,
      time: q.executedAt,
      user: q.user || 'N/A',
      protocol: q.protocol,
      target: q.deviceId || q.target || 'N/A',
      action: q.operation || q.action || 'N/A',
      status: q.status,
      duration: q.duration ? `${q.duration}ms` : 'N/A',
    }));
    exportCSV(exportData, `query-history-page-${page}.csv`);
  };

  const handleMenuOpen = (event, query) => {
    setMenuAnchor(event.currentTarget);
    setMenuQuery(query);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuQuery(null);
  };

  const handleMenuAction = (action) => {
    if (menuQuery) {
      switch (action) {
        case 'view':
          handleViewDetails(menuQuery);
          break;
        case 'rerun':
          handleRerun(menuQuery);
          break;
        case 'export':
          handleExportQuery(menuQuery);
          break;
        case 'favorite':
          handleToggleFavorite(menuQuery.id, menuQuery.isFavorite);
          break;
        default:
          break;
      }
    }
    handleMenuClose();
  };

  const clearFilters = () => {
    setProtocolFilter('');
    setStatusFilter('');
    setSearchText('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      case 'pending':
      case 'running':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Query History</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportPage}
            disabled={!currentData?.items?.length}
          >
            Export Page
          </Button>
          <IconButton onClick={handleRefresh} aria-label="Refresh">
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Query history tabs">
          <Tab label="All Queries" />
          <Tab label="Favorites" />
        </Tabs>
      </Paper>

      {!isFavoritesTab && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
            <TextField
              label="Search"
              placeholder="Search by target, action, etc."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="small"
              fullWidth
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Protocol</InputLabel>
              <Select
                value={protocolFilter}
                label="Protocol"
                onChange={(e) => setProtocolFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="snmp">SNMP</MenuItem>
                <MenuItem value="webpa">WebPA</MenuItem>
                <MenuItem value="tr069">TR-069</MenuItem>
                <MenuItem value="tr369">TR-369/USP</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Button onClick={clearFilters} variant="outlined">Clear Filters</Button>
          </Stack>
        </Paper>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load query history: {error.message}
        </Alert>
      )}

      {!isLoading && !error && currentData && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Protocol</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Action/Params</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.items && currentData.items.length > 0 ? (
                  currentData.items.map((query) => (
                    <TableRow key={query.id} hover>
                      <TableCell>
                        {query.executedAt ? new Date(query.executedAt).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>{query.user || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={query.protocol?.toUpperCase()} size="small" />
                      </TableCell>
                      <TableCell>{query.deviceId || query.target || 'N/A'}</TableCell>
                      <TableCell>
                        {query.operation || query.action || 'N/A'}
                        {query.parameters && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {JSON.stringify(query.parameters).slice(0, 50)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={query.status || 'unknown'}
                          size="small"
                          color={getStatusColor(query.status)}
                        />
                      </TableCell>
                      <TableCell>{query.duration ? `${query.duration}ms` : 'N/A'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(query)}
                            aria-label="View details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rerun Query">
                          <IconButton
                            size="small"
                            onClick={() => handleRerun(query)}
                            aria-label="Rerun query"
                          >
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={query.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleFavorite(query.id, query.isFavorite)}
                            aria-label="Toggle favorite"
                          >
                            {query.isFavorite ? <StarIcon fontSize="small" color="primary" /> : <StarBorderIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, query)}
                          aria-label="More actions"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" py={4}>
                        {isFavoritesTab ? 'No favorite queries yet.' : 'No query history found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalPages={currentData.totalPages}
            onChange={handlePaginationChange}
          />
        </>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItemOption onClick={() => handleMenuAction('view')}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItemOption>
        <MenuItemOption onClick={() => handleMenuAction('rerun')}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} /> Rerun
        </MenuItemOption>
        <MenuItemOption onClick={() => handleMenuAction('export')}>
          <GetAppIcon fontSize="small" sx={{ mr: 1 }} /> Export Query
        </MenuItemOption>
        <MenuItemOption onClick={() => handleMenuAction('favorite')}>
          {menuQuery?.isFavorite ? (
            <><StarBorderIcon fontSize="small" sx={{ mr: 1 }} /> Remove Favorite</>
          ) : (
            <><StarIcon fontSize="small" sx={{ mr: 1 }} /> Add Favorite</>
          )}
        </MenuItemOption>
      </Menu>

      <QueryDetailsDialog
        open={detailsDialogOpen}
        query={selectedQuery}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedQuery(null);
        }}
        onRerun={handleRerun}
        onExport={handleExportQuery}
      />
    </Box>
  );
}

export default QueryHistory;
