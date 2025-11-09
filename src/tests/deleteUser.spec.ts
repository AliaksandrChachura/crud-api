import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { mockedUsers } from './setupTests.js';
import { ErrorMessage } from '../types.js';
import { updateUsersData, initializeUsersData } from '../db/usersData.js';

const { server } = await import('../server.js');

describe('DELETE /api/users/{userId}', () => {
  beforeEach(async () => {
    await initializeUsersData();
    updateUsersData([...mockedUsers]);
  });

  it('should delete an existing user and return status code 204', async () => {
    const userId = mockedUsers[0].id;

    const response = await request(server).delete(`/api/users/${userId}`);

    expect(response.status).toBe(204);
  });

  it('should return status code 400 and corresponding message if userId is invalid', async () => {
    const userId = 'invalidUserId';
    const response = await request(server).delete('/api/users/invalidUserId');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: ErrorMessage.InvalidUserId });
  });

  it('should return status code 404 and corresponding message if user with userId does not exist', async () => {
    const userId = '456b3fa0-c339-4c1f-84df-04027eebdf7d';

    const response = await request(server).delete(`/api/users/${userId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: ErrorMessage.UserNotFound });
  });
});