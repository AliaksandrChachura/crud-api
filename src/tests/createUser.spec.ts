import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import http from 'node:http';
import { ErrorMessage } from '../types.js';
import { initializeUsersData, updateUsersData } from '../db/usersData.js';
import { mockUuidv4, createTestServer, closeTestServer } from './setupTests.js';

let server: http.Server;

beforeEach(async () => {
  await initializeUsersData();
  updateUsersData([]);
  mockUuidv4.mockClear();
  server = await createTestServer();
});

afterEach(async () => {
  await closeTestServer(server);
});

describe('POST /api/users', () => {
  test('POST /api/users should create a new user and return the created record', async () => {
    const newUser = { username: 'John', age: 25, hobbies: ['running', 'swimming'] };

    mockUuidv4.mockImplementation(() => 'mockedId');
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
