import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import * as configApi from '../api/config';

// PUBLIC_INTERFACE
/**
 * MIB Upload page component
 * Allows users to upload and manage SNMP MIB files
 */
const MIBUpload = () => {
  const [mibs, setMibs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMibs();
  }, []);

  const loadMibs = async () => {
    setLoading(true);
    try {
      const data = await configApi.getMibs();
      setMibs(data.mibs || data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load MIBs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await configApi.uploadMib(file);
      setSuccess(`MIB file "${file.name}" uploaded successfully`);
      loadMibs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload MIB');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (mibId) => {
    if (!window.confirm('Are you sure you want to delete this MIB?')) {
      return;
    }

    try {
      await configApi.deleteMib(mibId);
      setSuccess('MIB deleted successfully');
      loadMibs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete MIB');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        MIB Management
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Upload SNMP MIB files for OID translation and parameter discovery
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload MIB File
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <input
            accept=".mib,.txt"
            style={{ display: 'none' }}
            id="mib-upload-file"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="mib-upload-file">
            <Button
              variant="contained"
              component="span"
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Select MIB File'}
            </Button>
          </label>
          <Typography variant="body2" color="textSecondary">
            Supported formats: .mib, .txt
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Uploaded MIBs
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : mibs.length > 0 ? (
          <List>
            {mibs.map((mib) => (
              <ListItem key={mib.id} divider>
                <ListItemText
                  primary={mib.name || mib.filename}
                  secondary={
                    <>
                      {mib.uploadedAt && `Uploaded: ${new Date(mib.uploadedAt).toLocaleString()}`}
                      {mib.size && ` • Size: ${(mib.size / 1024).toFixed(2)} KB`}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(mib.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box py={4} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              No MIB files uploaded yet
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MIBUpload;
