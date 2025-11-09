import { describe, test, expect, jest } from '@jest/globals';
import request from 'supertest';
import { ErrorMessage } from '../types';

const mockUuidv4 = jest.fn(() => 'default-mock-id');
const mockValidate = jest.fn(() => true);

jest.unstable_mockModule('uuid', () => ({
  v4: mockUuidv4,
  validate: mockValidate,
}));

const { server } = await import('../server.js');

describe('POST /api/users', () => {
  beforeEach(() => {
    mockUuidv4.mockClear();
  });

  test('POST /api/users should create a new user and return the created record', async () => {
    const newUser = { username: 'John', age: 25, hobbies: ['running', 'swimming'] };

    mockUuidv4.mockReturnValue('mockedId');
    const response = await request(server).post('/api/users').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'mockedId', ...newUser });
  });

  test('POST /api/users should return status code 400 and corresponding message if request body does not contain required fields', async () => {
    const newUser = { age: 25, hobbies: ['running', 'swimming'] };

    const response = await request(server).post('/api/users').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: ErrorMessage.MissingFields });
  });
});
