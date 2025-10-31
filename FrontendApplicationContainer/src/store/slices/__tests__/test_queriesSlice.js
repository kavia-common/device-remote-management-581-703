import configureMockStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import queriesReducer, {
  cancelQuery,
  addActiveQuery,
  updateQueryStatus,
  selectActiveQueryById,
  selectIsQueryCancelling,
  selectCanCancelQuery,
} from '../queriesSlice';
import * as protocolsApi from '../../../api/protocols';

jest.mock('../../../api/protocols');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('queriesSlice - cancelQuery', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cancelQuery thunk', () => {
    it('should handle successful cancellation', async () => {
      const jobId = 'test-job-123';
      const mockResponse = { success: true, message: 'Query cancelled' };
      protocolsApi.cancelQuery.mockResolvedValue(mockResponse);

      const store = mockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'pending' },
          },
          cancellingQueries: {},
        },
      });

      await store.dispatch(cancelQuery(jobId));

      const actions = store.getActions();
      expect(actions[0].type).toBe('queries/cancel/pending');
      expect(actions[1].type).toBe('queries/cancel/fulfilled');
      expect(actions[1].payload).toEqual({ jobId, ...mockResponse });
      expect(protocolsApi.cancelQuery).toHaveBeenCalledWith(jobId);
    });

    it('should handle cancellation failure', async () => {
      const jobId = 'test-job-123';
      const mockError = { message: 'Cancellation failed' };
      protocolsApi.cancelQuery.mockRejectedValue({
        response: { data: mockError },
      });

      const store = mockStore({
        queries: {
          activeQueries: {
            [jobId]: { jobId, status: 'pending' },
          },
          cancellingQueries: {},
        },
      });

      await store.dispatch(cancelQuery(jobId));

      const actions = store.getActions();
      expect(actions[0].type).toBe('queries/cancel/pending');
      expect(actions[1].type).toBe('queries/cancel/rejected');
    });
  });

  describe('cancelQuery reducer', () => {
    it('should set cancelling state on pending', () => {
      const jobId = 'test-job-123';
      const initialState = {
        activeQueries: {
          [jobId]: { jobId, status: 'pending' },
        },
        cancellingQueries: {},
        results: {},
        history: [],
        pagination: { page: 1, pageSize: 50, totalPages: 0, totalItems: 0 },
        loading: false,
        error: null,
        realtimeConnected: false,
      };

      const action = { type: cancelQuery.pending.type, meta: { arg: jobId } };
      const state = queriesReducer(initialState, action);

      expect(state.cancellingQueries[jobId]).toBe(true);
    });

    it('should update query status on fulfilled', () => {
      const jobId = 'test-job-123';
      const initialState = {
        activeQueries: {
          [jobId]: { jobId, status: 'pending' },
        },
        cancellingQueries: { [jobId]: true },
        results: {},
        history: [{ jobId, status: 'pending' }],
        pagination: { page: 1, pageSize: 50, totalPages: 0, totalItems: 0 },
        loading: false,
        error: null,
        realtimeConnected: false,
      };

      const action = {
        type: cancelQuery.fulfilled.type,
        payload: { jobId, success: true },
      };
      const state = queriesReducer(initialState, action);

      expect(state.cancellingQueries[jobId]).toBeUndefined();
      expect(state.activeQueries[jobId].status).toBe('cancelled');
      expect(state.activeQueries[jobId].cancelledAt).toBeDefined();
      expect(state.history[0].status).toBe('cancelled');
    });

    it('should clear cancelling state on rejected', () => {
      const jobId = 'test-job-123';
      const initialState = {
        activeQueries: {
          [jobId]: { jobId, status: 'pending' },
        },
        cancellingQueries: { [jobId]: true },
        results: {},
        history: [],
        pagination: { page: 1, pageSize: 50, totalPages: 0, totalItems: 0 },
        loading: false,
        error: null,
        realtimeConnected: false,
      };

      const action = {
        type: cancelQuery.rejected.type,
        meta: { arg: jobId },
        payload: { message: 'Failed to cancel' },
      };
      const state = queriesReducer(initialState, action);

      expect(state.cancellingQueries[jobId]).toBeUndefined();
      expect(state.error).toBe('Failed to cancel');
    });
  });

  describe('selectors', () => {
    const createState = (activeQueries = {}, cancellingQueries = {}) => ({
      queries: {
        activeQueries,
        cancellingQueries,
        results: {},
        history: [],
        pagination: { page: 1, pageSize: 50, totalPages: 0, totalItems: 0 },
        loading: false,
        error: null,
        realtimeConnected: false,
      },
    });

    it('selectActiveQueryById should return query if exists', () => {
      const jobId = 'test-job-123';
      const query = { jobId, status: 'pending' };
      const state = createState({ [jobId]: query });

      expect(selectActiveQueryById(jobId)(state)).toEqual(query);
    });

    it('selectIsQueryCancelling should return true when cancelling', () => {
      const jobId = 'test-job-123';
      const state = createState({}, { [jobId]: true });

      expect(selectIsQueryCancelling(jobId)(state)).toBe(true);
    });

    it('selectIsQueryCancelling should return false when not cancelling', () => {
      const jobId = 'test-job-123';
      const state = createState({}, {});

      expect(selectIsQueryCancelling(jobId)(state)).toBe(false);
    });

    it('selectCanCancelQuery should return true for in-flight queries', () => {
      const jobId = 'test-job-123';
      const state = createState({ [jobId]: { jobId, status: 'pending' } });

      expect(selectCanCancelQuery(jobId)(state)).toBe(true);
    });

    it('selectCanCancelQuery should return false for completed queries', () => {
      const jobId = 'test-job-123';
      const state = createState({ [jobId]: { jobId, status: 'completed' } });

      expect(selectCanCancelQuery(jobId)(state)).toBe(false);
    });

    it('selectCanCancelQuery should return false when query not found', () => {
      const jobId = 'test-job-123';
      const state = createState({});

      expect(selectCanCancelQuery(jobId)(state)).toBe(false);
    });
  });
});
