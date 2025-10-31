import * as queriesApi from '../queries';
import axiosInstance from '../axios';

jest.mock('../axios');

describe('Queries API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listFavorites', () => {
    it('should fetch favorites list', async () => {
      const mockData = { data: [{ id: '1', name: 'Favorite 1' }] };
      axiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await queriesApi.listFavorites({ page: 1 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/queries/favorites', {
        params: { page: 1 },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('createFavorite', () => {
    it('should create a new favorite', async () => {
      const favoriteData = {
        name: 'Test Favorite',
        protocol: 'SNMP',
        operation: 'GET',
        parameters: { oids: ['1.3.6.1'] },
      };
      const mockResponse = { data: { id: '1', ...favoriteData } };
      axiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await queriesApi.createFavorite(favoriteData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/queries/favorites',
        favoriteData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFavorite', () => {
    it('should fetch a specific favorite', async () => {
      const mockData = { data: { id: '1', name: 'Favorite 1' } };
      axiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await queriesApi.getFavorite('1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/queries/favorites/1');
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteFavorite', () => {
    it('should delete a favorite', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      axiosInstance.delete.mockResolvedValue({ data: mockResponse });

      const result = await queriesApi.deleteFavorite('1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/queries/favorites/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('starQuery', () => {
    it('should star a query from history', async () => {
      const mockData = { data: { id: 'fav1', jobId: 'job1' } };
      axiosInstance.post.mockResolvedValue({ data: mockData });

      const result = await queriesApi.starQuery('job1', {
        name: 'Starred Query',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('/queries/job1/star', {
        name: 'Starred Query',
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('unstarQuery', () => {
    it('should unstar a query', async () => {
      const mockResponse = { data: { message: 'Unstarred' } };
      axiosInstance.delete.mockResolvedValue({ data: mockResponse });

      const result = await queriesApi.unstarQuery('job1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/queries/job1/star');
      expect(result).toEqual(mockResponse);
    });
  });
});
