import queriesReducer, {
  fetchFavorites,
  createFavorite,
  deleteFavorite,
  starQuery,
  unstarQuery,
  selectFavorites,
  selectIsQueryStarred,
  selectFavoriteIdByJobId,
} from '../queriesSlice';

describe('queriesSlice - Favorites', () => {
  const initialState = {
    history: [],
    activeQueries: {},
    cancellingQueries: {},
    results: {},
    favorites: [],
    favoritesByJobId: {},
    loadingFavorites: false,
    favoritesError: null,
    pagination: {
      page: 1,
      pageSize: 50,
      totalPages: 0,
      totalItems: 0,
    },
    favoritesPagination: {
      page: 1,
      pageSize: 50,
      totalPages: 0,
      totalItems: 0,
    },
    loading: false,
    error: null,
    realtimeConnected: false,
  };

  describe('fetchFavorites', () => {
    it('should set loading state on pending', () => {
      const action = { type: fetchFavorites.pending.type };
      const state = queriesReducer(initialState, action);
      expect(state.loadingFavorites).toBe(true);
      expect(state.favoritesError).toBe(null);
    });

    it('should populate favorites on fulfilled', () => {
      const mockFavorites = [
        { id: '1', name: 'Favorite 1', protocol: 'SNMP', jobId: 'job1' },
        { id: '2', name: 'Favorite 2', protocol: 'WebPA', jobId: 'job2' },
      ];
      const action = {
        type: fetchFavorites.fulfilled.type,
        payload: { data: mockFavorites },
      };
      const state = queriesReducer(initialState, action);
      expect(state.loadingFavorites).toBe(false);
      expect(state.favorites).toEqual(mockFavorites);
      expect(state.favoritesByJobId).toEqual({
        job1: '1',
        job2: '2',
      });
    });

    it('should set error on rejected', () => {
      const action = {
        type: fetchFavorites.rejected.type,
        payload: { message: 'Failed to fetch' },
      };
      const state = queriesReducer(initialState, action);
      expect(state.loadingFavorites).toBe(false);
      expect(state.favoritesError).toBe('Failed to fetch');
    });
  });

  describe('createFavorite', () => {
    it('should add favorite to state on fulfilled', () => {
      const newFavorite = {
        id: '3',
        name: 'New Favorite',
        protocol: 'TR69',
        jobId: 'job3',
      };
      const action = {
        type: createFavorite.fulfilled.type,
        payload: { data: newFavorite },
      };
      const state = queriesReducer(initialState, action);
      expect(state.favorites).toContainEqual(newFavorite);
      expect(state.favoritesByJobId['job3']).toBe('3');
    });

    it('should set error on rejected', () => {
      const action = {
        type: createFavorite.rejected.type,
        payload: { message: 'Failed to create' },
      };
      const state = queriesReducer(initialState, action);
      expect(state.favoritesError).toBe('Failed to create');
    });
  });

  describe('deleteFavorite', () => {
    it('should remove favorite from state on fulfilled', () => {
      const stateWithFavorite = {
        ...initialState,
        favorites: [
          { id: '1', name: 'Favorite 1', jobId: 'job1' },
          { id: '2', name: 'Favorite 2', jobId: 'job2' },
        ],
        favoritesByJobId: { job1: '1', job2: '2' },
      };
      const action = {
        type: deleteFavorite.fulfilled.type,
        payload: { favoriteId: '1' },
      };
      const state = queriesReducer(stateWithFavorite, action);
      expect(state.favorites).toHaveLength(1);
      expect(state.favorites[0].id).toBe('2');
      expect(state.favoritesByJobId['job1']).toBeUndefined();
    });
  });

  describe('starQuery', () => {
    it('should add starred query to favorites and update history', () => {
      const stateWithHistory = {
        ...initialState,
        history: [{ jobId: 'job1', protocol: 'SNMP', operation: 'GET' }],
      };
      const action = {
        type: starQuery.fulfilled.type,
        payload: {
          jobId: 'job1',
          favorite: {
            data: { id: 'fav1', name: 'Starred Query', jobId: 'job1' },
          },
        },
      };
      const state = queriesReducer(stateWithHistory, action);
      expect(state.favorites).toHaveLength(1);
      expect(state.favorites[0].id).toBe('fav1');
      expect(state.favoritesByJobId['job1']).toBe('fav1');
      expect(state.history[0].isStarred).toBe(true);
      expect(state.history[0].favoriteId).toBe('fav1');
    });
  });

  describe('unstarQuery', () => {
    it('should remove starred query from favorites and update history', () => {
      const stateWithStarred = {
        ...initialState,
        favorites: [{ id: 'fav1', name: 'Starred Query', jobId: 'job1' }],
        favoritesByJobId: { job1: 'fav1' },
        history: [
          { jobId: 'job1', isStarred: true, favoriteId: 'fav1' },
        ],
      };
      const action = {
        type: unstarQuery.fulfilled.type,
        payload: { jobId: 'job1' },
      };
      const state = queriesReducer(stateWithStarred, action);
      expect(state.favorites).toHaveLength(0);
      expect(state.favoritesByJobId['job1']).toBeUndefined();
      expect(state.history[0].isStarred).toBe(false);
      expect(state.history[0].favoriteId).toBeUndefined();
    });
  });

  describe('selectors', () => {
    const mockState = {
      queries: {
        ...initialState,
        favorites: [
          { id: '1', name: 'Fav 1' },
          { id: '2', name: 'Fav 2' },
        ],
        favoritesByJobId: { job1: '1', job2: '2' },
      },
    };

    it('selectFavorites should return all favorites', () => {
      expect(selectFavorites(mockState)).toHaveLength(2);
    });

    it('selectIsQueryStarred should return true for starred query', () => {
      expect(selectIsQueryStarred('job1')(mockState)).toBe(true);
    });

    it('selectIsQueryStarred should return false for non-starred query', () => {
      expect(selectIsQueryStarred('job99')(mockState)).toBe(false);
    });

    it('selectFavoriteIdByJobId should return favorite ID', () => {
      expect(selectFavoriteIdByJobId('job1')(mockState)).toBe('1');
    });

    it('selectFavoriteIdByJobId should return undefined for unknown job', () => {
      expect(selectFavoriteIdByJobId('job99')(mockState)).toBeUndefined();
    });
  });
});
