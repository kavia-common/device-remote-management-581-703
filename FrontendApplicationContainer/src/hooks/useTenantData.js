import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { selectCurrentTenant } from '../store/slices/authSlice';

// PUBLIC_INTERFACE
/**
 * Custom hook for managing tenant-aware data fetching
 * Automatically invalidates queries when tenant changes
 * 
 * @param {string[]} queryKeys - Array of query keys to invalidate on tenant change
 * @returns {string} currentTenant - The current tenant ID
 * 
 * @example
 * // In a component that fetches tenant-specific data
 * const currentTenant = useTenantData(['devices', 'queries']);
 */
export const useTenantData = (queryKeys = []) => {
  const queryClient = useQueryClient();
  const currentTenant = useSelector(selectCurrentTenant);

  useEffect(() => {
    // When tenant changes, invalidate specified queries
    if (currentTenant && queryKeys.length > 0) {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    }
  }, [currentTenant, queryClient, queryKeys]);

  return currentTenant;
};

// PUBLIC_INTERFACE
/**
 * Hook to get tenant-aware query key
 * Appends tenant ID to query key for proper caching per tenant
 * 
 * @param {string|string[]} baseKey - Base query key(s)
 * @returns {string[]} Query key with tenant ID appended
 * 
 * @example
 * const queryKey = useTenantQueryKey(['devices']);
 * // Returns: ['devices', 'tenant-123']
 */
export const useTenantQueryKey = (baseKey) => {
  const currentTenant = useSelector(selectCurrentTenant);
  const keyArray = Array.isArray(baseKey) ? baseKey : [baseKey];
  
  if (currentTenant) {
    return [...keyArray, `tenant-${currentTenant}`];
  }
  
  return keyArray;
};

export default useTenantData;
