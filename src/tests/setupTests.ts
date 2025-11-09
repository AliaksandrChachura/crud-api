import { User } from '../db/types.js';
import { jest } from '@jest/globals';
import http from 'node:http';
import { getUsersData } from '../db/usersData.js';
import { ErrorMessage, HttpStatus } from '../types.js';

export const mockedUsers: User[] = [
  {
    id: '60924b85-6f5a-4c0d-8ac1-5a784add23ed',
    username: 'Ali',
    age: 47,
    hobbies: ['runnings', 'jogging', 'maga'],
  },
  {
    id: 'b1f3634c-057d-4582-b0ab-fe8238aefe6b',
    username: 'Ali',
    age: 47,
    hobbies: ['running', 'jogging', 'maga'],
  },
  {
    id: '103a9142-2919-4e61-a18d-ac9ca014302f',
    username: 'AliBaba',
    age: 45,
    hobbies: ['runnin', 'jogging', 'maga'],
  },
  {
    id: '68555da3-bb2c-450d-8212-2c2de867194c',
    username: 'Alex',
    age: 4325,
    hobbies: ['runnin', 'maga'],
  },
];

export const mockUuidv4 = jest.fn(() => 'default-mock-id');
export const mockValidate = jest.fn(() => true);

jest.unstable_mockModule('uuid', () => ({
  v4: mockUuidv4,
  validate: mockValidate,
}));

export const createTestServer = async (): Promise<http.Server> => {
  const { routes } = await import('../routes/userRoutes.js');
  const { handleError } = await import('../utils/utils.js');

  const server = http.createServer(async (request, response) => {
    request.users = getUsersData();

    try {
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

  return server;
};

export const closeTestServer = async (server: http.Server): Promise<void> => {
  if (server) {
    server.closeAllConnections();
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
};
