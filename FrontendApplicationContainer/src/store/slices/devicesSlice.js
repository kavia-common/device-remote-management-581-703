import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as devicesApi from '../../api/devices';

// Async thunks

// PUBLIC_INTERFACE
/**
 * Fetch devices async thunk
 */
export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (params, { rejectWithValue }) => {
    try {
      const response = await devicesApi.getDevices(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch devices' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Fetch device stats async thunk
 */
export const fetchDeviceStats = createAsyncThunk(
  'devices/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await devicesApi.getDeviceStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch stats' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Create device async thunk
 */
export const createDevice = createAsyncThunk(
  'devices/create',
  async (deviceData, { rejectWithValue }) => {
    try {
      const response = await devicesApi.createDevice(deviceData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create device' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Update device async thunk
 */
export const updateDevice = createAsyncThunk(
  'devices/update',
  async ({ deviceId, deviceData }, { rejectWithValue }) => {
    try {
      const response = await devicesApi.updateDevice(deviceId, deviceData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update device' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Delete device async thunk
 */
export const deleteDevice = createAsyncThunk(
  'devices/delete',
  async (deviceId, { rejectWithValue }) => {
    try {
      await devicesApi.deleteDevice(deviceId);
      return deviceId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete device' });
    }
  }
);

// Initial state
const initialState = {
  devices: [],
  stats: null,
  pagination: {
    page: 1,
    pageSize: 50,
    totalPages: 0,
    totalItems: 0,
  },
  loading: false,
  error: null,
};

// Slice
const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch devices
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload.data || action.payload.devices || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch devices';
      })
      // Fetch stats
      .addCase(fetchDeviceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Create device
      .addCase(createDevice.fulfilled, (state, action) => {
        state.devices.push(action.payload);
      })
      // Update device
      .addCase(updateDevice.fulfilled, (state, action) => {
        const index = state.devices.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.devices[index] = action.payload;
        }
      })
      // Delete device
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.devices = state.devices.filter(d => d.id !== action.payload);
      });
  },
});

export const { clearError } = devicesSlice.actions;
export default devicesSlice.reducer;
