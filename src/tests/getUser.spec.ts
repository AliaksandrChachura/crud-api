import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { mockedUsers } from './setupTests.js';
import { ErrorMessage } from '../types.js';
import { updateUsersData, initializeUsersData } from '../db/usersData.js';

const { server } = await import('../server.js');

describe('GET /api/users/{userId}', () => {
  beforeEach(async () => {
    await initializeUsersData();
    updateUsersData([...mockedUsers]);
  });

  it('should respond with status code 200 and record with id === userId if it exists', async () => {
    const userId = mockedUsers[0].id;

    const response = await request(server).get(`/api/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedUsers[0]);
  });

  it('should respond with status code 400 and corresponding message if userId is invalid', async () => {
    const userId = 'invalidUserId';

    const response = await request(server).get(`/api/users/${userId}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(ErrorMessage.InvalidUserId);
  });

  it("should respond with status code 404 and corresponding message if record with id === userId doesn't exist", async () => {
    const userId = '456b3fa0-c339-4c1f-84df-04027eebdf7d';

    const response = await request(server).get(`/api/users/${userId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(ErrorMessage.UserNotFound);
  });
});
