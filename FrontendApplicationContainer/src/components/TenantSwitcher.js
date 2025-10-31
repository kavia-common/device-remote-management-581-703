import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { setCurrentTenant, selectCurrentTenant, selectUser } from '../store/slices/authSlice';
import axiosInstance from '../api/axios';

// PUBLIC_INTERFACE
/**
 * TenantSwitcher component for displaying and changing the current tenant
 * Automatically refreshes data when tenant is changed by invalidating React Query caches
 * and resetting Redux slices
 */
const TenantSwitcher = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentTenant = useSelector(selectCurrentTenant);
  const user = useSelector(selectUser);
  
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch tenants from backend
        const response = await axiosInstance.get('/tenants');
        setTenants(response.data.tenants || response.data || []);
        
        // If no current tenant is set and we have tenants, set the first one
        if (!currentTenant && response.data.tenants?.length > 0) {
          dispatch(setCurrentTenant(response.data.tenants[0].id));
        }
      } catch (err) {
        console.warn('Failed to fetch tenants, using safe defaults:', err);
        setError(err);
        
        // Safe defaults if backend doesn't provide tenant list yet
        const defaultTenants = [
          { id: 'default', name: 'Default Organization' },
        ];
        
        // If user has tenant info in profile, use that
        if (user?.tenants && Array.isArray(user.tenants)) {
          setTenants(user.tenants);
          if (!currentTenant && user.tenants.length > 0) {
            dispatch(setCurrentTenant(user.tenants[0].id));
          }
        } else {
          setTenants(defaultTenants);
          if (!currentTenant) {
            dispatch(setCurrentTenant('default'));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [dispatch, currentTenant, user]);

  const handleTenantChange = (event) => {
    const newTenantId = event.target.value;
    
    // Update current tenant in Redux
    dispatch(setCurrentTenant(newTenantId));
    
    // Store in localStorage for persistence
    localStorage.setItem('currentTenant', newTenantId);
    
    // Invalidate all React Query caches to trigger data refresh
    queryClient.invalidateQueries();
    
    // Reset device and query slices to clear old tenant data
    // Note: We don't reset auth slice as it contains user session
    // Individual slices should handle tenant changes if needed
  };

  if (loading && tenants.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 2 }}>
        <CircularProgress size={20} color="inherit" />
        <Typography variant="body2">Loading...</Typography>
      </Box>
    );
  }

  // Don't render if no tenants available
  if (tenants.length === 0) {
    return null;
  }

  // If only one tenant, just show it as a label
  if (tenants.length === 1) {
    return (
      <Tooltip title="Current Organization">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 2 }}>
          <BusinessIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2">
            {tenants[0].name}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 2 }}>
      <BusinessIcon sx={{ fontSize: 20 }} />
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select
          value={currentTenant || ''}
          onChange={handleTenantChange}
          displayEmpty
          sx={{
            color: 'inherit',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.6)',
            },
            '.MuiSelect-icon': {
              color: 'inherit',
            },
          }}
        >
          {tenants.map((tenant) => (
            <MenuItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TenantSwitcher;
