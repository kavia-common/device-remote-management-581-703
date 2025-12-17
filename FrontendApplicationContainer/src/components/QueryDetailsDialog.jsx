import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Tab,
  Tabs,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
  GetApp as GetAppIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

// PUBLIC_INTERFACE
function QueryDetailsDialog({ open, query, onClose, onRerun, onExport }) {
  /**
   * Dialog component to display detailed query information including request, response, errors, and metadata.
   * @param {boolean} open - Dialog open state
   * @param {Object} query - Query object with details
   * @param {Function} onClose - Close handler
   * @param {Function} onRerun - Rerun handler
   * @param {Function} onExport - Export handler
   */
  const [activeTab, setActiveTab] = useState(0);

  if (!query) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Query Details</Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {/* Summary Section */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Summary
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Query ID:</Typography>
                <Typography variant="body2">{query.id}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Protocol:</Typography>
                <Chip label={query.protocol?.toUpperCase() || 'N/A'} size="small" />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Status:</Typography>
                <Chip
                  label={query.status || 'unknown'}
                  size="small"
                  color={getStatusColor(query.status)}
                />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Executed At:</Typography>
                <Typography variant="body2">
                  {query.executedAt ? new Date(query.executedAt).toLocaleString() : 'N/A'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Duration:</Typography>
                <Typography variant="body2">
                  {query.duration ? `${query.duration}ms` : 'N/A'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">User:</Typography>
                <Typography variant="body2">{query.user || 'N/A'}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Target Device:</Typography>
                <Typography variant="body2">{query.deviceId || query.target || 'N/A'}</Typography>
              </Box>
            </Stack>
          </Paper>

          <Divider />

          {/* Tabs for Request/Response/Errors */}
          <Box>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} aria-label="Query details tabs">
              <Tab label="Request" />
              <Tab label="Response" />
              {query.error && <Tab label="Errors" />}
              <Tab label="Metadata" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                  onClick={() => handleCopy(JSON.stringify(query.request || query.parameters, null, 2))}
                  aria-label="Copy request"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="subtitle2" gutterBottom>Request Payload</Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 300,
                  fontSize: '0.875rem',
                }}
              >
                {JSON.stringify(query.request || query.parameters || {}, null, 2)}
              </Box>
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                  onClick={() => handleCopy(JSON.stringify(query.response || query.result, null, 2))}
                  aria-label="Copy response"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="subtitle2" gutterBottom>Response Payload</Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 300,
                  fontSize: '0.875rem',
                }}
              >
                {JSON.stringify(query.response || query.result || { message: 'No response data available' }, null, 2)}
              </Box>
            </Paper>
          )}

          {activeTab === 2 && query.error && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="error">Error Details</Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 300,
                  fontSize: '0.875rem',
                }}
              >
                {typeof query.error === 'string' ? query.error : JSON.stringify(query.error, null, 2)}
              </Box>
            </Paper>
          )}

          {activeTab === (query.error ? 3 : 2) && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Additional Metadata</Typography>
              <Stack spacing={1}>
                {query.operation && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Operation:</Typography>
                    <Typography variant="body2">{query.operation}</Typography>
                  </Box>
                )}
                {query.action && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Action:</Typography>
                    <Typography variant="body2">{query.action}</Typography>
                  </Box>
                )}
                {query.createdAt && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Created At:</Typography>
                    <Typography variant="body2">{new Date(query.createdAt).toLocaleString()}</Typography>
                  </Box>
                )}
                {query.name && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Query Name:</Typography>
                    <Typography variant="body2">{query.name}</Typography>
                  </Box>
                )}
                {query.isFavorite !== undefined && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Favorite:</Typography>
                    <Typography variant="body2">{query.isFavorite ? 'Yes' : 'No'}</Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onExport && onExport(query)} startIcon={<GetAppIcon />}>
          Export
        </Button>
        <Button onClick={() => onRerun && onRerun(query)} startIcon={<PlayArrowIcon />} variant="contained">
          Rerun Query
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QueryDetailsDialog;
