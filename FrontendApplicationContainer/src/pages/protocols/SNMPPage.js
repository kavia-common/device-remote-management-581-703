import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  FolderOpen as LoadIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { fetchDevices } from '../../store/slices/devicesSlice';
import { 
  addActiveQuery, 
  cancelQuery, 
  selectActiveQueryById,
  selectIsQueryCancelling,
  selectCanCancelQuery,
  fetchFavorites,
  createFavorite,
  deleteFavorite,
  selectFavorites,
} from '../../store/slices/queriesSlice';
import { hasPermission } from '../../utils/permissions';
import * as protocolsApi from '../../api/protocols';
import useToast from '../../hooks/useToast';
import MetadataDrawer from '../../components/MetadataDrawer';

const operations = ['GET', 'SET', 'WALK'];

// PUBLIC_INTERFACE
/**
 * SNMP protocol page component
 * Provides interface for SNMP operations (GET, SET, WALK) with favorites support
 */
const SNMPPage = () => {
  const dispatch = useDispatch();
  const { devices } = useSelector((state) => state.devices);
  const favorites = useSelector(selectFavorites);
  const { user } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  
  const userPermissions = user?.permissions || [];
  const canReadFavorites = hasPermission(userPermissions, 'queries:favorites:read');
  const canWriteFavorites = hasPermission(userPermissions, 'queries:favorites:write');

  const [operation, setOperation] = useState('GET');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [oids, setOids] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [currentJobId, setCurrentJobId] = useState(null);
  
  // Favorites dialogs
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');
  const [favoriteDescription, setFavoriteDescription] = useState('');
  const [savingFavorite, setSavingFavorite] = useState(false);
  
  // Help drawer
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);

  // Realtime query status from Redux store
  const activeQuery = useSelector((state) => 
    currentJobId ? selectActiveQueryById(currentJobId)(state) : null
  );
  const isQueryCancelling = useSelector((state) => 
    currentJobId ? selectIsQueryCancelling(currentJobId)(state) : false
  );
  const canCancelQuery = useSelector((state) => 
    currentJobId ? selectCanCancelQuery(currentJobId)(state) : false
  );

  useEffect(() => {
    dispatch(fetchDevices({ pageSize: 100 }));
    if (canReadFavorites) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, canReadFavorites]);

  const snmpDevices = devices.filter(d => d.protocol === 'SNMP');
  const snmpFavorites = favorites.filter(f => f.protocol === 'SNMP');

  const handleAddOid = () => {
    setOids([...oids, '']);
  };

  const handleOidChange = (index, value) => {
    const newOids = [...oids];
    newOids[index] = value;
    setOids(newOids);
  };

  const handleRemoveOid = (index) => {
    if (oids.length > 1) {
      const newOids = oids.filter((_, i) => i !== index);
      setOids(newOids);
    }
  };

  const handleCancel = async () => {
    if (!currentJobId) return;

    try {
      await dispatch(cancelQuery(currentJobId)).unwrap();
      showToast('Query cancelled successfully', { type: 'success' });
      setCurrentJobId(null);
    } catch (err) {
      showToast(err.message || 'Failed to cancel query', { type: 'error' });
    }
  };

  const handleSubmit = async () => {
    setError('');
    setResult(null);
    setCurrentJobId(null);

    if (!selectedDevice) {
      setError('Please select a device');
      return;
    }

    const validOids = oids.filter(oid => oid.trim() !== '');
    if (validOids.length === 0) {
      setError('Please enter at least one OID');
      return;
    }

    setLoading(true);

    try {
      let response;
      const requestData = {
        deviceId: selectedDevice,
        oids: validOids,
      };

      switch (operation) {
        case 'GET':
          response = await protocolsApi.snmpGet(requestData);
          break;
        case 'SET':
          response = await protocolsApi.snmpSet(requestData);
          break;
        case 'WALK':
          response = await protocolsApi.snmpWalk(requestData);
          break;
        default:
          throw new Error('Invalid operation');
      }

      setResult(response);

      // Add to active queries
      if (response.jobId) {
        setCurrentJobId(response.jobId);
        dispatch(addActiveQuery({
          jobId: response.jobId,
          queryData: {
            protocol: 'SNMP',
            operation,
            deviceId: selectedDevice,
            oids: validOids,
          },
        }));
        showToast('Query submitted successfully', { type: 'success' });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Operation failed';
      setError(errorMessage);
      showToast(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSaveDialog = () => {
    if (!canWriteFavorites) {
      showToast('You do not have permission to save favorites', { type: 'error' });
      return;
    }
    
    const validOids = oids.filter(oid => oid.trim() !== '');
    if (!selectedDevice || validOids.length === 0) {
      showToast('Please configure the query before saving', { type: 'warning' });
      return;
    }
    
    // Pre-fill with a default name
    const deviceName = snmpDevices.find(d => d.id === selectedDevice)?.name || selectedDevice;
    setFavoriteName(`SNMP ${operation} - ${deviceName}`);
    setFavoriteDescription('');
    setSaveDialogOpen(true);
  };

  const handleSaveFavorite = async () => {
    if (!favoriteName.trim()) {
      showToast('Please enter a name for the favorite', { type: 'warning' });
      return;
    }

    setSavingFavorite(true);
    try {
      const validOids = oids.filter(oid => oid.trim() !== '');
      await dispatch(
        createFavorite({
          name: favoriteName,
          description: favoriteDescription,
          protocol: 'SNMP',
          operation,
          deviceId: selectedDevice,
          parameters: {
            oids: validOids,
          },
        })
      ).unwrap();
      
      showToast('Favorite saved successfully', { type: 'success' });
      setSaveDialogOpen(false);
      setFavoriteName('');
      setFavoriteDescription('');
    } catch (err) {
      showToast(err.message || 'Failed to save favorite', { type: 'error' });
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleLoadFavorite = (favorite) => {
    setOperation(favorite.operation || 'GET');
    setSelectedDevice(favorite.deviceId || '');
    setOids(favorite.parameters?.oids || ['']);
    setLoadDialogOpen(false);
    showToast(`Loaded favorite: ${favorite.name}`, { type: 'success' });
  };

  const handleDeleteFavorite = async (favoriteId, event) => {
    event.stopPropagation();
    
    if (!canWriteFavorites) {
      showToast('You do not have permission to delete favorites', { type: 'error' });
      return;
    }

    try {
      await dispatch(deleteFavorite(favoriteId)).unwrap();
      showToast('Favorite deleted successfully', { type: 'success' });
    } catch (err) {
      showToast(err.message || 'Failed to delete favorite', { type: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4">SNMP Protocol</Typography>
          <Typography variant="body2" color="textSecondary">
            Execute SNMP v2/v3 operations: GET, SET, and WALK
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Open help and parameter reference">
            <IconButton
              color="primary"
              onClick={() => setHelpDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
          {canReadFavorites && (
          <Box>
            <Tooltip title="Save current query as favorite">
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleOpenSaveDialog}
                sx={{ mr: 1 }}
              >
                Save as Favorite
              </Button>
            </Tooltip>
            <Tooltip title="Load a saved favorite query">
              <Button
                variant="outlined"
                startIcon={<LoadIcon />}
                onClick={() => setLoadDialogOpen(true)}
              >
                Load Favorite
              </Button>
            </Tooltip>
          </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Operation Parameters
            </Typography>

            <TextField
              select
              fullWidth
              label="Operation"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              margin="normal"
            >
              {operations.map((op) => (
                <MenuItem key={op} value={op}>
                  {op}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Device"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              margin="normal"
            >
              {snmpDevices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name} ({device.ipAddress})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                OIDs
              </Typography>
              {oids.map((oid, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., 1.3.6.1.2.1.1.1.0"
                    value={oid}
                    onChange={(e) => handleOidChange(index, e.target.value)}
                  />
                  {oids.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRemoveOid(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddOid}
                size="small"
                sx={{ mt: 1 }}
              >
                Add OID
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Executing...' : 'Execute'}
            </Button>

            {canCancelQuery && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={isQueryCancelling ? <CircularProgress size={20} /> : <CancelIcon />}
                onClick={handleCancel}
                disabled={isQueryCancelling}
                sx={{ mt: 2 }}
              >
                {isQueryCancelling ? 'Cancelling...' : 'Cancel Query'}
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>

            {result || activeQuery ? (
              <Box>
                <Box mb={2}>
                  <Chip
                    label={`Job ID: ${result?.jobId || currentJobId}`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={activeQuery?.status || result?.status || 'Pending'}
                    color={
                      activeQuery?.status === 'completed' ? 'success' :
                      activeQuery?.status === 'error' ? 'error' :
                      activeQuery?.status === 'cancelled' ? 'warning' :
                      'info'
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                  {activeQuery?.progress !== undefined && (
                    <Chip
                      label={`${activeQuery.progress}%`}
                      color="default"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>

                {activeQuery?.message && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {activeQuery.message}
                  </Alert>
                )}

                {activeQuery?.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {activeQuery.error}
                  </Alert>
                )}

                {(result?.data || activeQuery?.data) && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>OID</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(result?.data || activeQuery?.data || {}).map(([oid, value]) => (
                          <TableRow key={oid}>
                            <TableCell>{oid}</TableCell>
                            <TableCell>{String(value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {result?.message && !activeQuery?.message && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {result.message}
                  </Typography>
                )}
              </Box>
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary" align="center">
                    No results yet. Execute an operation to see results here.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Save Favorite Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save as Favorite</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={favoriteName}
            onChange={(e) => setFavoriteName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={favoriteDescription}
            onChange={(e) => setFavoriteDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveFavorite}
            variant="contained"
            disabled={savingFavorite}
            startIcon={savingFavorite ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Favorite Dialog */}
      <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Load Favorite Query</DialogTitle>
        <DialogContent>
          {snmpFavorites.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
              No saved favorites for SNMP protocol
            </Typography>
          ) : (
            <List>
              {snmpFavorites.map((favorite) => (
                <ListItem
                  key={favorite.id}
                  disablePadding
                  secondaryAction={
                    canWriteFavorites && (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleDeleteFavorite(favorite.id, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemButton onClick={() => handleLoadFavorite(favorite)}>
                    <ListItemText
                      primary={favorite.name}
                      secondary={
                        <>
                          {favorite.description && <div>{favorite.description}</div>}
                          <div>
                            {favorite.operation} • {favorite.parameters?.oids?.length || 0} OIDs
                          </div>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Metadata Help Drawer */}
      <MetadataDrawer
        open={helpDrawerOpen}
        onClose={() => setHelpDrawerOpen(false)}
        protocol="SNMP"
      />
    </Box>
  );
};

export default SNMPPage;
