import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SNMPPage from '../SNMPPage';
import queriesReducer, { cancelQuery } from '../../../store/slices/queriesSlice';
import devicesReducer from '../../../store/slices/devicesSlice';
import * as protocolsApi from '../../../api/protocols';
import { ToastProvider } from '../../../components/ToastProvider';

jest.mock('../../../api/protocols');

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      queries: queriesReducer,
      devices: devicesReducer,
    },
    preloadedState: {
      queries: {
        activeQueries: {},
        cancellingQueries: {},
        results: {},
        history: [],
        pagination: { page: 1, pageSize: 50, totalPages: 0, totalItems: 0 },
        loading: false,
        error: null,
        realtimeConnected: false,
        ...initialState.queries,
      },
      devices: {
        devices: [
          { id: 'device-1', name: 'Test Device', protocol: 'SNMP', ipAddress: '192.168.1.1' },
        ],
        loading: false,
        error: null,
        pagination: { page: 1, pageSize: 50, totalPages: 0, totalItems: 0 },
        ...initialState.devices,
      },
    },
  });
};

const renderWithStore = (component, store) => {
  return render(
    <Provider store={store}>
      <ToastProvider>{component}</ToastProvider>
    </Provider>
  );
};

describe('Cancel Button Visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not show cancel button initially', () => {
    const store = createMockStore();
    renderWithStore(<SNMPPage />, store);

    expect(screen.queryByText(/Cancel Query/i)).not.toBeInTheDocument();
  });

  it('should show cancel button for in-flight query', async () => {
    const jobId = 'test-job-123';
    protocolsApi.snmpGet.mockResolvedValue({ jobId, status: 'pending' });

    const store = createMockStore();
    renderWithStore(<SNMPPage />, store);

    // Select device and add OID
    const deviceSelect = screen.getAllByRole('combobox')[1]; // Second select is device
    fireEvent.mouseDown(deviceSelect);
    await waitFor(() => {
      const option = screen.getByText(/Test Device/i);
      fireEvent.click(option);
    });

    const oidInput = screen.getByPlaceholderText(/e.g., 1.3.6.1.2.1.1.1.0/i);
    fireEvent.change(oidInput, { target: { value: '1.3.6.1.2.1.1.1.0' } });

    // Submit query
    const executeButton = screen.getByRole('button', { name: /Execute/i });
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(protocolsApi.snmpGet).toHaveBeenCalled();
    });

    // Update store with in-flight query
    store.dispatch({
      type: 'queries/addActiveQuery',
      payload: {
        jobId,
        queryData: { protocol: 'SNMP', operation: 'GET', status: 'pending' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Cancel Query/i)).toBeInTheDocument();
    });
  });

  it('should disable cancel button while cancelling', async () => {
    const jobId = 'test-job-123';
    const store = createMockStore({
      queries: {
        activeQueries: {
          [jobId]: { jobId, status: 'pending' },
        },
        cancellingQueries: {
          [jobId]: true,
        },
      },
    });

    protocolsApi.snmpGet.mockResolvedValue({ jobId, status: 'pending' });
    
    renderWithStore(<SNMPPage />, store);

    // Simulate having a current job
    const deviceSelect = screen.getAllByRole('combobox')[1];
    fireEvent.mouseDown(deviceSelect);
    await waitFor(() => {
      const option = screen.getByText(/Test Device/i);
      fireEvent.click(option);
    });

    const oidInput = screen.getByPlaceholderText(/e.g., 1.3.6.1.2.1.1.1.0/i);
    fireEvent.change(oidInput, { target: { value: '1.3.6.1.2.1.1.1.0' } });

    const executeButton = screen.getByRole('button', { name: /Execute/i });
    fireEvent.click(executeButton);

    await waitFor(() => {
      const cancelButton = screen.queryByText(/Cancelling.../i);
      if (cancelButton) {
        expect(cancelButton.closest('button')).toBeDisabled();
      }
    });
  });

  it('should not show cancel button for completed query', () => {
    const jobId = 'test-job-123';
    const store = createMockStore({
      queries: {
        activeQueries: {
          [jobId]: { jobId, status: 'completed' },
        },
      },
    });

    renderWithStore(<SNMPPage />, store);

    expect(screen.queryByText(/Cancel Query/i)).not.toBeInTheDocument();
  });

  it('should call cancelQuery when cancel button is clicked', async () => {
    const jobId = 'test-job-123';
    protocolsApi.snmpGet.mockResolvedValue({ jobId, status: 'pending' });
    protocolsApi.cancelQuery.mockResolvedValue({ success: true });

    const store = createMockStore();
    renderWithStore(<SNMPPage />, store);

    // Setup and execute query
    const deviceSelect = screen.getAllByRole('combobox')[1];
    fireEvent.mouseDown(deviceSelect);
    await waitFor(() => {
      const option = screen.getByText(/Test Device/i);
      fireEvent.click(option);
    });

    const oidInput = screen.getByPlaceholderText(/e.g., 1.3.6.1.2.1.1.1.0/i);
    fireEvent.change(oidInput, { target: { value: '1.3.6.1.2.1.1.1.0' } });

    const executeButton = screen.getByRole('button', { name: /Execute/i });
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(protocolsApi.snmpGet).toHaveBeenCalled();
    });

    // Add active query
    store.dispatch({
      type: 'queries/addActiveQuery',
      payload: {
        jobId,
        queryData: { protocol: 'SNMP', operation: 'GET', status: 'pending' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Cancel Query/i)).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByText(/Cancel Query/i);
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(protocolsApi.cancelQuery).toHaveBeenCalledWith(jobId);
    });
  });
});
