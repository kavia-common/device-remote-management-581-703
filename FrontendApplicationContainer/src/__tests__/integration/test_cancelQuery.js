import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import queriesReducer, {
  cancelQuery,
  addActiveQuery,
  selectCanCancelQuery,
  selectIsQueryCancelling,
} from '../../store/slices/queriesSlice';
import * as protocolsApi from '../../api/protocols';
import { ToastProvider } from '../../components/ToastProvider';
import useToast from '../../hooks/useToast';

jest.mock('../../api/protocols');

// Test component that uses cancel functionality
const CancelQueryTestComponent = ({ jobId }) => {
  const { showToast } = useToast();
  const [cancelling, setCancelling] = React.useState(false);
  const [activeJobs, setActiveJobs] = React.useState({ [jobId]: { status: 'pending' } });

  const canCancel = activeJobs[jobId]?.status === 'pending' || 
                    activeJobs[jobId]?.status === 'processing' ||
                    activeJobs[jobId]?.status === 'running';

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await protocolsApi.cancelQuery(jobId);
      setActiveJobs({ ...activeJobs, [jobId]: { status: 'cancelled' } });
      showToast('Query cancelled successfully', { type: 'success' });
    } catch (error) {
      showToast(error.message || 'Failed to cancel query', { type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <div data-testid="query-status">{activeJobs[jobId]?.status || 'unknown'}</div>
      {canCancel && (
        <button 
          onClick={handleCancel} 
          disabled={cancelling}
          data-testid="cancel-button"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Query'}
        </button>
      )}
    </div>
  );
};

// Helper to create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      queries: queriesReducer,
    },
    preloadedState: {
      queries: {
        history: [],
        activeQueries: {},
        cancellingQueries: {},
        results: {},
        favorites: [],
        favoritesByJobId: {},
        loadingFavorites: false,
        favoritesError: null,
        pagination: { page: 1, pageSize: 50, totalPages: 0, totalItems: 0 },
        favoritesPagination: { page: 1, pageSize: 50, totalPages: 0, totalItems: 0 },
        loading: false,
        error: null,
        realtimeConnected: false,
        ...initialState.queries,
      },
    },
  });
};

describe('Cancel Query Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cancel Button Visibility', () => {
    it('should show cancel button for in-flight query (pending)', () => {
      const jobId = 'job-123';
      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'pending', protocol: 'SNMP' },
          },
        },
      });

      const canCancel = selectCanCancelQuery(jobId)(store.getState());
      expect(canCancel).toBe(true);
    });

    it('should show cancel button for in-flight query (processing)', () => {
      const jobId = 'job-123';
      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'processing', protocol: 'SNMP' },
          },
        },
      });

      const canCancel = selectCanCancelQuery(jobId)(store.getState());
      expect(canCancel).toBe(true);
    });

    it('should show cancel button for in-flight query (running)', () => {
      const jobId = 'job-123';
      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'running', protocol: 'SNMP' },
          },
        },
      });

      const canCancel = selectCanCancelQuery(jobId)(store.getState());
      expect(canCancel).toBe(true);
    });

    it('should not show cancel button for completed query', () => {
      const jobId = 'job-123';
      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'completed', protocol: 'SNMP' },
          },
        },
      });

      const canCancel = selectCanCancelQuery(jobId)(store.getState());
      expect(canCancel).toBe(false);
    });

    it('should not show cancel button for cancelled query', () => {
      const jobId = 'job-123';
      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'cancelled', protocol: 'SNMP' },
          },
        },
      });

      const canCancel = selectCanCancelQuery(jobId)(store.getState());
      expect(canCancel).toBe(false);
    });

    it('should not show cancel button for error query', () => {
      const jobId = 'job-123';
      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'error', protocol: 'SNMP' },
          },
        },
      });

      const canCancel = selectCanCancelQuery(jobId)(store.getState());
      expect(canCancel).toBe(false);
    });

    it('should not show cancel button for unknown job', () => {
      const jobId = 'job-123';
      const store = createMockStore({
        queries: {
          activeQueries: {},
        },
      });

      const canCancel = selectCanCancelQuery(jobId)(store.getState());
      expect(canCancel).toBe(false);
    });
  });

  describe('Cancel Query Dispatch', () => {
    it('should dispatch cancelQuery action successfully', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockResolvedValue({ success: true, message: 'Query cancelled' });

      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'pending' },
          },
        },
      });

      await store.dispatch(cancelQuery(jobId));

      const state = store.getState();
      expect(state.queries.activeQueries[jobId].status).toBe('cancelled');
      expect(state.queries.cancellingQueries[jobId]).toBeUndefined();
    });

    it('should set cancelling state while cancellation is in progress', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'pending' },
          },
        },
      });

      const promise = store.dispatch(cancelQuery(jobId));

      // Check cancelling state
      let state = store.getState();
      expect(state.queries.cancellingQueries[jobId]).toBe(true);

      const isCancelling = selectIsQueryCancelling(jobId)(state);
      expect(isCancelling).toBe(true);

      await promise;

      state = store.getState();
      expect(state.queries.cancellingQueries[jobId]).toBeUndefined();
    });

    it('should handle cancel query error', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockRejectedValue({
        response: { data: { message: 'Failed to cancel query' } },
      });

      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'pending' },
          },
        },
      });

      await store.dispatch(cancelQuery(jobId));

      const state = store.getState();
      expect(state.queries.error).toBe('Failed to cancel query');
      expect(state.queries.cancellingQueries[jobId]).toBeUndefined();
      // Query should remain in active state
      expect(state.queries.activeQueries[jobId].status).toBe('pending');
    });

    it('should update history when query is cancelled', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockResolvedValue({ success: true });

      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'pending', protocol: 'SNMP' },
          },
          history: [
            { jobId, status: 'pending', protocol: 'SNMP' },
          ],
        },
      });

      await store.dispatch(cancelQuery(jobId));

      const state = store.getState();
      expect(state.queries.history[0].status).toBe('cancelled');
      expect(state.queries.history[0].cancelledAt).toBeDefined();
    });
  });

  describe('Cancel Query with Toasts', () => {
    it('should show success toast when query is cancelled', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockResolvedValue({ success: true });

      render(
        <Provider store={createMockStore()}>
          <ToastProvider>
            <CancelQueryTestComponent jobId={jobId} />
          </ToastProvider>
        </Provider>
      );

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/Query cancelled successfully/i)).toBeInTheDocument();
      });
    });

    it('should show error toast when cancellation fails', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockRejectedValue({
        message: 'Network error',
      });

      render(
        <Provider store={createMockStore()}>
          <ToastProvider>
            <CancelQueryTestComponent jobId={jobId} />
          </ToastProvider>
        </Provider>
      );

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should disable cancel button while cancelling', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      render(
        <Provider store={createMockStore()}>
          <ToastProvider>
            <CancelQueryTestComponent jobId={jobId} />
          </ToastProvider>
        </Provider>
      );

      const cancelButton = screen.getByTestId('cancel-button');
      expect(cancelButton).not.toBeDisabled();

      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/Cancelling.../i)).toBeInTheDocument();
      });

      const disabledButton = screen.getByTestId('cancel-button');
      expect(disabledButton).toBeDisabled();
    });

    it('should hide cancel button after successful cancellation', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockResolvedValue({ success: true });

      render(
        <Provider store={createMockStore()}>
          <ToastProvider>
            <CancelQueryTestComponent jobId={jobId} />
          </ToastProvider>
        </Provider>
      );

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('query-status')).toHaveTextContent('cancelled');
    });
  });

  describe('Multiple Query Cancellations', () => {
    it('should handle cancelling multiple queries independently', async () => {
      jest.setTimeout(10000);
      const jobId1 = 'job-1';
      const jobId2 = 'job-2';

      protocolsApi.cancelQuery.mockResolvedValue({ success: true });

      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId1]: { jobId: jobId1, status: 'pending' },
            [jobId2]: { jobId: jobId2, status: 'processing' },
          },
        },
      });

      // Cancel first query
      await store.dispatch(cancelQuery(jobId1));

      let state = store.getState();
      expect(state.queries.activeQueries[jobId1].status).toBe('cancelled');
      expect(state.queries.activeQueries[jobId2].status).toBe('processing');

      // Cancel second query
      await store.dispatch(cancelQuery(jobId2));

      state = store.getState();
      expect(state.queries.activeQueries[jobId2].status).toBe('cancelled');
    });

    it('should allow cancelling the same query multiple times (idempotent)', async () => {
      jest.setTimeout(10000);
      const jobId = 'job-123';
      
      protocolsApi.cancelQuery.mockResolvedValue({ success: true });

      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'pending' },
          },
        },
      });

      // Start first cancellation
      await store.dispatch(cancelQuery(jobId));

      let state = store.getState();
      expect(state.queries.activeQueries[jobId].status).toBe('cancelled');

      // Try to cancel again - should not throw error
      await store.dispatch(cancelQuery(jobId));

      // Both API calls should have been made
      expect(protocolsApi.cancelQuery).toHaveBeenCalledTimes(2);

      state = store.getState();
      expect(state.queries.cancellingQueries[jobId]).toBeUndefined();
    });
  });

  describe('Cancel Query State Transitions', () => {
    it('should transition from pending to cancelled', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockResolvedValue({ success: true });

      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'pending', progress: 0 },
          },
        },
      });

      await store.dispatch(cancelQuery(jobId));

      const state = store.getState();
      expect(state.queries.activeQueries[jobId].status).toBe('cancelled');
      expect(state.queries.activeQueries[jobId].cancelledAt).toBeDefined();
    });

    it('should preserve query data after cancellation', async () => {
      const jobId = 'job-123';
      protocolsApi.cancelQuery.mockResolvedValue({ success: true });

      const queryData = {
        jobId,
        status: 'pending',
        protocol: 'SNMP',
        operation: 'GET',
        deviceId: 'device-1',
        oids: ['1.3.6.1.2.1.1.1.0'],
        startTime: new Date().toISOString(),
      };

      const store = createMockStore({
        queries: {
          activeQueries: {
            [jobId]: queryData,
          },
        },
      });

      await store.dispatch(cancelQuery(jobId));

      const state = store.getState();
      const updatedQuery = state.queries.activeQueries[jobId];
      expect(updatedQuery.protocol).toBe('SNMP');
      expect(updatedQuery.operation).toBe('GET');
      expect(updatedQuery.deviceId).toBe('device-1');
      expect(updatedQuery.oids).toEqual(['1.3.6.1.2.1.1.1.0']);
      expect(updatedQuery.status).toBe('cancelled');
    });
  });
});
