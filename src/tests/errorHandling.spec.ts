import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import { ErrorMessage } from '../types.js';

const mockGetUsersData = jest.fn(() => undefined);

jest.unstable_mockModule('../db/usersData.js', () => ({
  getUsersData: mockGetUsersData,
  initializeUsersData: jest.fn(),
  updateUsersData: jest.fn(),
}));

const { server } = await import('../server.js');

describe('Server Error Handling', () => {
  it('should respond with status code 404 when endpoint is not found', async () => {
    const response = await request(server).get('/api/invalid-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: ErrorMessage.EndpointNotFound,
    });
  });

  it('should respond with status code 500 when internal server error occurs', async () => {
    mockGetUsersData.mockReturnValue(undefined as unknown as never);

    const response = await request(server).get('/api/users');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: ErrorMessage.InternalServerError,
    });
  });
});