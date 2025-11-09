import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import http from 'node:http';
import { ErrorMessage, HttpStatus } from '../types.js';
import { getUsersData } from '../db/usersData.js';
import { handleError } from '../utils/utils.js';

const mockGetUsersData = jest.fn();

jest.unstable_mockModule('../db/usersData.js', () => ({
  getUsersData: mockGetUsersData,
  initializeUsersData: jest.fn(),
  updateUsersData: jest.fn(),
  handleMessage: jest.fn(),
}));

let server: http.Server;

describe('Server Error Handling', () => {
  beforeEach(async () => {
    mockGetUsersData.mockReturnValue([]);
    server = http.createServer(async (request, response) => {
      request.users = getUsersData();

      try {
        const { routes } = await import('../routes/userRoutes.js');
        await routes(request, response);
      } catch (error) {
        console.error('Route error:', error);
        if (!response.headersSent) {
          handleError(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.InternalServerError);
        }
      }
    });

    await new Promise<void>((resolve) => {
      server.listen(0, resolve);
    });
  });

  afterEach(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    }
  });

  it('should respond with status code 404 when endpoint is not found', async () => {
    const response = await request(server).get('/api/invalid-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: ErrorMessage.EndpointNotFound,
    });
  });

  it('should respond with status code 500 when internal server error occurs', async () => {
    mockGetUsersData.mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(server).get('/api/users');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: ErrorMessage.InternalServerError,
    });
  });
});
