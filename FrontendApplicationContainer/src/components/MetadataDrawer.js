import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import * as metadataApi from '../api/metadata';

// PUBLIC_INTERFACE
/**
 * MetadataDrawer component for displaying parameter descriptions and help
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {function} props.onClose - Callback when drawer is closed
 * @param {string} [props.protocol] - Protocol filter (SNMP, WebPA, TR69, TR369)
 * @param {string} [props.initialQuery] - Initial search query or parameter
 */
const MetadataDrawer = ({ open, onClose, protocol, initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [commonParams, setCommonParams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedParam, setSelectedParam] = useState(null);

  useEffect(() => {
    if (open && protocol) {
      loadCommonParameters();
    }
    if (open && initialQuery) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [open, protocol, initialQuery]);

  const loadCommonParameters = async () => {
    try {
      setLoading(true);
      const data = await metadataApi.getCommonParameters(protocol.toLowerCase());
      setCommonParams(data);
      setError('');
    } catch (err) {
      console.error('Failed to load common parameters:', err);
      setError('Failed to load common parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await metadataApi.searchMetadata({
        query: query.trim(),
        protocol: protocol?.toLowerCase(),
        pageSize: 20,
      });
      setSearchResults(data.items || data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.response?.data?.message || 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleParamClick = async (param) => {
    setSelectedParam(param);
    
    // If we don't have full details, fetch them
    if (!param.description && param.identifier) {
      try {
        const details = await metadataApi.getParameterDescription(
          protocol.toLowerCase(),
          param.identifier || param.oid || param.parameter || param.path
        );
        setSelectedParam({ ...param, ...details });
      } catch (err) {
        console.error('Failed to fetch parameter details:', err);
      }
    }
  };

  const renderParameterDetails = (param) => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
        <Typography variant="h6" component="div" sx={{ wordBreak: 'break-all' }}>
          {param.name || param.identifier || param.oid || param.parameter || param.path}
        </Typography>
        <IconButton size="small" onClick={() => setSelectedParam(null)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      {param.protocol && (
        <Chip label={param.protocol} size="small" color="primary" sx={{ mb: 1, mr: 1 }} />
      )}
      {param.type && (
        <Chip label={`Type: ${param.type}`} size="small" variant="outlined" sx={{ mb: 1, mr: 1 }} />
      )}
      {param.access && (
        <Chip label={`Access: ${param.access}`} size="small" variant="outlined" sx={{ mb: 1 }} />
      )}
      
      <Divider sx={{ my: 1.5 }} />
      
      {param.description && (
        <>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Description
          </Typography>
          <Typography variant="body2" paragraph>
            {param.description}
          </Typography>
        </>
      )}
      
      {param.syntax && (
        <>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Syntax
          </Typography>
          <Typography variant="body2" paragraph>
            {param.syntax}
          </Typography>
        </>
      )}
      
      {param.example && (
        <>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Example
          </Typography>
          <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
            <Typography variant="body2" component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>
              {param.example}
            </Typography>
          </Paper>
        </>
      )}
      
      {param.notes && (
        <>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 1 }}>
            Notes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {param.notes}
          </Typography>
        </>
      )}
    </Paper>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 480 },
          p: 2,
        },
      }}
    >
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <HelpIcon color="primary" />
            <Typography variant="h6">
              {protocol ? `${protocol} Help` : 'Parameter Help'}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Search Box */}
        <Box component="form" onSubmit={handleSearchSubmit} mb={3}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${protocol || 'parameters'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {/* Selected Parameter Details */}
        {selectedParam && renderParameterDetails(selectedParam)}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && !selectedParam && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Search Results ({searchResults.length})
            </Typography>
            <List>
              {searchResults.map((item, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleParamClick(item)}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                >
                  <ListItemText
                    primary={item.name || item.identifier || item.oid || item.parameter}
                    secondary={
                      <>
                        {item.description && (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {item.description}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Common Parameters */}
        {!loading && !searchQuery && commonParams.length > 0 && !selectedParam && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Common Parameters
            </Typography>
            <List>
              {commonParams.map((item, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleParamClick(item)}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                >
                  <ListItemText
                    primary={item.name || item.identifier || item.oid || item.parameter}
                    secondary={
                      item.description ? (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.description}
                        </Typography>
                      ) : null
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !selectedParam && searchResults.length === 0 && searchQuery && (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="textSecondary">
              No results found for "{searchQuery}"
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default MetadataDrawer;
