import devicesReducer, {
  fetchDevices,
  fetchDeviceStats,
  createDevice,
  updateDevice,
  deleteDevice,
  clearError
} from '../devicesSlice';

describe('devicesSlice', () => {
  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = devicesReducer(undefined, { type: '@@INIT' });
      
      expect(state.devices).toEqual([]);
      expect(state.stats).toBeNull();
      expect(state.pagination).toEqual({
        page: 1,
        pageSize: 50,
        totalPages: 0,
        totalItems: 0
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('reducers', () => {
    it('should handle clearError', () => {
      const initialState = {
        devices: [],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: false,
        error: 'Some error'
      };

      const state = devicesReducer(initialState, clearError());

      expect(state.error).toBeNull();
    });
  });

  describe('fetchDevices async thunk', () => {
    it('should handle fetchDevices.pending', () => {
      const initialState = {
        devices: [],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: false,
        error: 'Old error'
      };

      const state = devicesReducer(initialState, {
        type: fetchDevices.pending.type
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchDevices.fulfilled with devices array', () => {
      const initialState = {
        devices: [],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: true,
        error: null
      };

      const devices = [
        { id: '1', name: 'Device 1', protocol: 'SNMP' },
        { id: '2', name: 'Device 2', protocol: 'WebPA' }
      ];

      const state = devicesReducer(initialState, {
        type: fetchDevices.fulfilled.type,
        payload: { devices }
      });

      expect(state.loading).toBe(false);
      expect(state.devices).toEqual(devices);
    });

    it('should handle fetchDevices.fulfilled with pagination', () => {
      const initialState = {
        devices: [],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: true,
        error: null
      };

      const devices = [{ id: '1', name: 'Device 1' }];
      const pagination = {
        page: 2,
        pageSize: 25,
        totalPages: 5,
        totalItems: 100
      };

      const state = devicesReducer(initialState, {
        type: fetchDevices.fulfilled.type,
        payload: { devices, pagination }
      });

      expect(state.devices).toEqual(devices);
      expect(state.pagination).toEqual(pagination);
    });

    it('should handle fetchDevices.rejected', () => {
      const initialState = {
        devices: [],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: true,
        error: null
      };

      const state = devicesReducer(initialState, {
        type: fetchDevices.rejected.type,
        payload: { message: 'Failed to fetch devices' }
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch devices');
    });
  });

  describe('fetchDeviceStats async thunk', () => {
    it('should handle fetchDeviceStats.fulfilled', () => {
      const initialState = {
        devices: [],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: false,
        error: null
      };

      const stats = {
        totalDevices: 10,
        activeDevices: 8,
        byProtocol: { SNMP: 5, WebPA: 3, TR69: 2 }
      };

      const state = devicesReducer(initialState, {
        type: fetchDeviceStats.fulfilled.type,
        payload: stats
      });

      expect(state.stats).toEqual(stats);
    });
  });

  describe('createDevice async thunk', () => {
    it('should handle createDevice.fulfilled', () => {
      const initialState = {
        devices: [
          { id: '1', name: 'Device 1' }
        ],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: false,
        error: null
      };

      const newDevice = { id: '2', name: 'Device 2' };

      const state = devicesReducer(initialState, {
        type: createDevice.fulfilled.type,
        payload: newDevice
      });

      expect(state.devices).toHaveLength(2);
      expect(state.devices[1]).toEqual(newDevice);
    });
  });

  describe('updateDevice async thunk', () => {
    it('should handle updateDevice.fulfilled', () => {
      const initialState = {
        devices: [
          { id: '1', name: 'Device 1', status: 'active' },
          { id: '2', name: 'Device 2', status: 'active' }
        ],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: false,
        error: null
      };

      const updatedDevice = { id: '1', name: 'Updated Device 1', status: 'inactive' };

      const state = devicesReducer(initialState, {
        type: updateDevice.fulfilled.type,
        payload: updatedDevice
      });

      expect(state.devices[0]).toEqual(updatedDevice);
      expect(state.devices[1].name).toBe('Device 2');
    });

    it('should not change state if device not found', () => {
      const initialState = {
        devices: [
          { id: '1', name: 'Device 1' }
        ],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: false,
        error: null
      };

      const updatedDevice = { id: '99', name: 'Non-existent' };

      const state = devicesReducer(initialState, {
        type: updateDevice.fulfilled.type,
        payload: updatedDevice
      });

      expect(state.devices).toHaveLength(1);
      expect(state.devices[0].id).toBe('1');
    });
  });

  describe('deleteDevice async thunk', () => {
    it('should handle deleteDevice.fulfilled', () => {
      const initialState = {
        devices: [
          { id: '1', name: 'Device 1' },
          { id: '2', name: 'Device 2' },
          { id: '3', name: 'Device 3' }
        ],
        stats: null,
        pagination: {
          page: 1,
          pageSize: 50,
          totalPages: 0,
          totalItems: 0
        },
        loading: false,
        error: null
      };

      const state = devicesReducer(initialState, {
        type: deleteDevice.fulfilled.type,
        payload: '2'
      });

      expect(state.devices).toHaveLength(2);
      expect(state.devices.find(d => d.id === '2')).toBeUndefined();
      expect(state.devices.find(d => d.id === '1')).toBeDefined();
      expect(state.devices.find(d => d.id === '3')).toBeDefined();
    });
  });
});
