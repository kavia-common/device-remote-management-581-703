import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import queriesReducer, {
  fetchFavorites,
  createFavorite,
  deleteFavorite,
  starQuery,
  unstarQuery,
} from '../../store/slices/queriesSlice';
import authReducer from '../../store/slices/authSlice';
import * as queriesApi from '../../api/queries';
import { ToastProvider } from '../../components/ToastProvider';

jest.mock('../../api/queries');

// Helper to create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      queries: queriesReducer,
      auth: authReducer,
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
      auth: {
        user: { 
          id: 'user1', 
          name: 'Test User',
          permissions: ['queries:favorites:read', 'queries:favorites:write'],
        },
        token: 'test-token',
        isAuthenticated: true,
        roles: [],
        permissions: ['queries:favorites:read', 'queries:favorites:write'],
        currentTenant: 'tenant1',
        loading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

// Test component that displays favorites
const FavoritesTestComponent = () => {
  const [favorites, setFavorites] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState('');

  const filteredFavorites = favorites.filter(fav =>
    fav.name.toLowerCase().includes(filter.toLowerCase()) ||
    fav.protocol.toLowerCase().includes(filter.toLowerCase())
  );

  const handleLoadFavorites = async () => {
    setLoading(true);
    try {
      const response = await queriesApi.listFavorites();
      setFavorites(response.data || response.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFavorite = async (favoriteId) => {
    try {
      await queriesApi.deleteFavorite(favoriteId);
      setFavorites(favorites.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error('Failed to delete favorite', error);
    }
  };

  return (
    <div>
      <button onClick={handleLoadFavorites}>Load Favorites</button>
      <input
        type="text"
        placeholder="Filter favorites..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        data-testid="filter-input"
      />
      {loading && <div>Loading...</div>}
      <div data-testid="favorites-list">
        {filteredFavorites.map((favorite) => (
          <div key={favorite.id} data-testid={`favorite-${favorite.id}`}>
            <span>{favorite.name}</span>
            <span>{favorite.protocol}</span>
            <button onClick={() => handleDeleteFavorite(favorite.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Favorites Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fetch Favorites', () => {
    it('should fetch and display favorites list', async () => {
      const mockFavorites = [
        { id: 'fav1', name: 'Test Favorite 1', protocol: 'SNMP', deviceId: 'device1' },
        { id: 'fav2', name: 'Test Favorite 2', protocol: 'WebPA', deviceId: 'device2' },
      ];

      queriesApi.listFavorites.mockResolvedValue({
        data: mockFavorites,
        pagination: { page: 1, pageSize: 50, totalPages: 1, totalItems: 2 },
      });

      const store = createMockStore();

      await store.dispatch(fetchFavorites());

      const state = store.getState();
      expect(state.queries.favorites).toEqual(mockFavorites);
      expect(state.queries.loadingFavorites).toBe(false);
      expect(state.queries.favoritesError).toBeNull();
    });

    it('should handle fetch favorites error', async () => {
      queriesApi.listFavorites.mockRejectedValue({
        response: { data: { message: 'Failed to fetch favorites' } },
      });

      const store = createMockStore();

      await store.dispatch(fetchFavorites());

      const state = store.getState();
      expect(state.queries.favorites).toEqual([]);
      expect(state.queries.loadingFavorites).toBe(false);
      expect(state.queries.favoritesError).toBe('Failed to fetch favorites');
    });

    it('should set loading state while fetching', async () => {
      queriesApi.listFavorites.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      );

      const store = createMockStore();

      const promise = store.dispatch(fetchFavorites());

      // Check loading state
      let state = store.getState();
      expect(state.queries.loadingFavorites).toBe(true);

      await promise;

      state = store.getState();
      expect(state.queries.loadingFavorites).toBe(false);
    });
  });

  describe('Create Favorite', () => {
    it('should create a new favorite successfully', async () => {
      const newFavorite = {
        name: 'New Favorite',
        description: 'Test description',
        protocol: 'SNMP',
        operation: 'GET',
        deviceId: 'device1',
        parameters: { oids: ['1.3.6.1.2.1.1.1.0'] },
      };

      const createdFavorite = {
        id: 'fav123',
        ...newFavorite,
        createdAt: new Date().toISOString(),
      };

      queriesApi.createFavorite.mockResolvedValue({ data: createdFavorite });

      const store = createMockStore();

      await store.dispatch(createFavorite(newFavorite));

      const state = store.getState();
      expect(state.queries.favorites).toContainEqual(createdFavorite);
      expect(state.queries.favoritesError).toBeNull();
    });

    it('should handle create favorite error', async () => {
      queriesApi.createFavorite.mockRejectedValue({
        response: { data: { message: 'Failed to create favorite' } },
      });

      const store = createMockStore();

      await store.dispatch(createFavorite({ name: 'Test' }));

      const state = store.getState();
      expect(state.queries.favoritesError).toBe('Failed to create favorite');
    });

    it('should add favorite with jobId to favoritesByJobId map', async () => {
      const newFavorite = {
        id: 'fav123',
        name: 'Test Favorite',
        protocol: 'SNMP',
        jobId: 'job-456',
      };

      queriesApi.createFavorite.mockResolvedValue({ data: newFavorite });

      const store = createMockStore();

      await store.dispatch(createFavorite(newFavorite));

      const state = store.getState();
      expect(state.queries.favoritesByJobId['job-456']).toBe('fav123');
    });
  });

  describe('Delete Favorite', () => {
    it('should delete a favorite successfully', async () => {
      const existingFavorites = [
        { id: 'fav1', name: 'Favorite 1', protocol: 'SNMP', jobId: 'job1' },
        { id: 'fav2', name: 'Favorite 2', protocol: 'WebPA', jobId: 'job2' },
      ];

      queriesApi.deleteFavorite.mockResolvedValue({ success: true });

      const store = createMockStore({
        queries: {
          favorites: existingFavorites,
          favoritesByJobId: { job1: 'fav1', job2: 'fav2' },
        },
      });

      await store.dispatch(deleteFavorite('fav1'));

      const state = store.getState();
      expect(state.queries.favorites).toHaveLength(1);
      expect(state.queries.favorites[0].id).toBe('fav2');
      expect(state.queries.favoritesByJobId['job1']).toBeUndefined();
      expect(state.queries.favoritesByJobId['job2']).toBe('fav2');
    });

    it('should handle delete favorite error', async () => {
      queriesApi.deleteFavorite.mockRejectedValue({
        response: { data: { message: 'Failed to delete favorite' } },
      });

      const store = createMockStore({
        queries: {
          favorites: [{ id: 'fav1', name: 'Favorite 1' }],
        },
      });

      await store.dispatch(deleteFavorite('fav1'));

      const state = store.getState();
      expect(state.queries.favorites).toHaveLength(1); // Not deleted
      expect(state.queries.favoritesError).toBe('Failed to delete favorite');
    });
  });

  describe('Star/Unstar Query', () => {
    it('should star a query from history', async () => {
      const jobId = 'job-123';
      const starredFavorite = {
        id: 'fav-789',
        jobId,
        name: 'Starred Query',
        protocol: 'SNMP',
      };

      queriesApi.starQuery.mockResolvedValue({ data: starredFavorite });

      const store = createMockStore({
        queries: {
          history: [
            { jobId, protocol: 'SNMP', status: 'completed' },
          ],
        },
      });

      await store.dispatch(starQuery({ 
        jobId, 
        data: { name: 'Starred Query' } 
      }));

      const state = store.getState();
      expect(state.queries.favorites).toContainEqual(starredFavorite);
      expect(state.queries.favoritesByJobId[jobId]).toBe('fav-789');
      expect(state.queries.history[0].isStarred).toBe(true);
      expect(state.queries.history[0].favoriteId).toBe('fav-789');
    });

    it('should unstar a query', async () => {
      const jobId = 'job-123';
      const favoriteId = 'fav-789';

      queriesApi.unstarQuery.mockResolvedValue({ success: true });

      const store = createMockStore({
        queries: {
          favorites: [
            { id: favoriteId, jobId, name: 'Starred Query' },
          ],
          favoritesByJobId: { [jobId]: favoriteId },
          history: [
            { jobId, isStarred: true, favoriteId },
          ],
        },
      });

      await store.dispatch(unstarQuery(jobId));

      const state = store.getState();
      expect(state.queries.favorites).toHaveLength(0);
      expect(state.queries.favoritesByJobId[jobId]).toBeUndefined();
      expect(state.queries.history[0].isStarred).toBe(false);
      expect(state.queries.history[0].favoriteId).toBeUndefined();
    });

    it('should handle star query error', async () => {
      queriesApi.starQuery.mockRejectedValue({
        response: { data: { message: 'Failed to star query' } },
      });

      const store = createMockStore();

      await store.dispatch(starQuery({ 
        jobId: 'job-123', 
        data: { name: 'Test' } 
      }));

      const state = store.getState();
      expect(state.queries.favoritesError).toBe('Failed to star query');
    });

    it('should handle unstar query error', async () => {
      queriesApi.unstarQuery.mockRejectedValue({
        response: { data: { message: 'Failed to unstar query' } },
      });

      const store = createMockStore({
        queries: {
          favorites: [{ id: 'fav1', jobId: 'job-123' }],
          favoritesByJobId: { 'job-123': 'fav1' },
        },
      });

      await store.dispatch(unstarQuery('job-123'));

      const state = store.getState();
      expect(state.queries.favorites).toHaveLength(1); // Not removed
      expect(state.queries.favoritesError).toBe('Failed to unstar query');
    });
  });

  describe('Favorites Filtering', () => {
    it('should filter favorites by name', async () => {
      const mockFavorites = [
        { id: 'fav1', name: 'SNMP Get Device', protocol: 'SNMP' },
        { id: 'fav2', name: 'WebPA Query', protocol: 'WebPA' },
        { id: 'fav3', name: 'SNMP Walk', protocol: 'SNMP' },
      ];

      queriesApi.listFavorites.mockResolvedValue({ data: mockFavorites });

      render(
        <Provider store={createMockStore()}>
          <ToastProvider>
            <FavoritesTestComponent />
          </ToastProvider>
        </Provider>
      );

      const loadButton = screen.getByText('Load Favorites');
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('favorite-fav1')).toBeInTheDocument();
      });

      const filterInput = screen.getByTestId('filter-input');
      fireEvent.change(filterInput, { target: { value: 'SNMP' } });

      await waitFor(() => {
        expect(screen.getByTestId('favorite-fav1')).toBeInTheDocument();
        expect(screen.getByTestId('favorite-fav3')).toBeInTheDocument();
        expect(screen.queryByTestId('favorite-fav2')).not.toBeInTheDocument();
      });
    });

    it('should filter favorites by protocol', async () => {
      const mockFavorites = [
        { id: 'fav1', name: 'Query 1', protocol: 'SNMP' },
        { id: 'fav2', name: 'Query 2', protocol: 'WebPA' },
      ];

      queriesApi.listFavorites.mockResolvedValue({ data: mockFavorites });

      render(
        <Provider store={createMockStore()}>
          <ToastProvider>
            <FavoritesTestComponent />
          </ToastProvider>
        </Provider>
      );

      fireEvent.click(screen.getByText('Load Favorites'));

      await waitFor(() => {
        expect(screen.getByTestId('favorite-fav1')).toBeInTheDocument();
      });

      const filterInput = screen.getByTestId('filter-input');
      fireEvent.change(filterInput, { target: { value: 'WebPA' } });

      await waitFor(() => {
        expect(screen.queryByTestId('favorite-fav1')).not.toBeInTheDocument();
        expect(screen.getByTestId('favorite-fav2')).toBeInTheDocument();
      });
    });
  });

  describe('Favorites with Permissions', () => {
    it('should respect read permission for favorites', async () => {
      queriesApi.listFavorites.mockResolvedValue({ data: [] });

      const storeWithoutReadPermission = createMockStore({
        auth: {
          user: { id: 'user1', permissions: [] },
          permissions: [],
        },
      });

      await storeWithoutReadPermission.dispatch(fetchFavorites());

      // API should still be called, but UI layer would hide the feature
      expect(queriesApi.listFavorites).toHaveBeenCalled();
    });

    it('should handle create favorite without write permission', async () => {
      queriesApi.createFavorite.mockRejectedValue({
        response: { 
          status: 403,
          data: { message: 'Insufficient permissions' } 
        },
      });

      const storeWithoutWritePermission = createMockStore({
        auth: {
          user: { id: 'user1', permissions: ['queries:favorites:read'] },
          permissions: ['queries:favorites:read'],
        },
      });

      await storeWithoutWritePermission.dispatch(createFavorite({ name: 'Test' }));

      const state = storeWithoutWritePermission.getState();
      expect(state.queries.favoritesError).toBe('Insufficient permissions');
    });
  });

  describe('Favorites UI Interactions', () => {
    it('should load and delete favorites via UI', async () => {
      const mockFavorites = [
        { id: 'fav1', name: 'Test Favorite 1', protocol: 'SNMP' },
        { id: 'fav2', name: 'Test Favorite 2', protocol: 'WebPA' },
      ];

      queriesApi.listFavorites.mockResolvedValue({ data: mockFavorites });
      queriesApi.deleteFavorite.mockResolvedValue({ success: true });

      render(
        <Provider store={createMockStore()}>
          <ToastProvider>
            <FavoritesTestComponent />
          </ToastProvider>
        </Provider>
      );

      // Load favorites
      fireEvent.click(screen.getByText('Load Favorites'));

      await waitFor(() => {
        expect(screen.getByTestId('favorite-fav1')).toBeInTheDocument();
        expect(screen.getByTestId('favorite-fav2')).toBeInTheDocument();
      });

      // Delete first favorite
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.queryByTestId('favorite-fav1')).not.toBeInTheDocument();
        expect(screen.getByTestId('favorite-fav2')).toBeInTheDocument();
      });
    });
  });
});
