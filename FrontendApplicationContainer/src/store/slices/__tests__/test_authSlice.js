import authReducer, { loginUser, registerUser, logoutUser, clearError, setUser } from '../authSlice';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should load user from localStorage', () => {
      const user = { id: '1', email: 'test@test.com' };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'test-token');

      // Re-import to get fresh initial state
      jest.resetModules();
      const authReducer = require('../authSlice').default;
      
      const state = authReducer(undefined, { type: '@@INIT' });
      
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('reducers', () => {
    it('should handle clearError', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Some error'
      };

      const state = authReducer(initialState, clearError());

      expect(state.error).toBeNull();
    });

    it('should handle setUser', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

      const user = { id: '1', email: 'test@test.com' };
      const state = authReducer(initialState, setUser(user));

      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('loginUser async thunk', () => {
    it('should handle loginUser.pending', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Old error'
      };

      const state = authReducer(initialState, {
        type: loginUser.pending.type
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle loginUser.fulfilled', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null
      };

      const payload = {
        user: { id: '1', email: 'test@test.com' },
        token: 'test-token'
      };

      const state = authReducer(initialState, {
        type: loginUser.fulfilled.type,
        payload
      });

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe(payload.token);
      expect(state.error).toBeNull();
    });

    it('should handle loginUser.rejected', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null
      };

      const state = authReducer(initialState, {
        type: loginUser.rejected.type,
        payload: { message: 'Login failed' }
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Login failed');
    });
  });

  describe('registerUser async thunk', () => {
    it('should handle registerUser.pending', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

      const state = authReducer(initialState, {
        type: registerUser.pending.type
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle registerUser.fulfilled', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null
      };

      const state = authReducer(initialState, {
        type: registerUser.fulfilled.type
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle registerUser.rejected', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null
      };

      const state = authReducer(initialState, {
        type: registerUser.rejected.type,
        payload: { message: 'Registration failed' }
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Registration failed');
    });
  });

  describe('logoutUser async thunk', () => {
    it('should handle logoutUser.fulfilled', () => {
      const initialState = {
        user: { id: '1', email: 'test@test.com' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null
      };

      const state = authReducer(initialState, {
        type: logoutUser.fulfilled.type
      });

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
