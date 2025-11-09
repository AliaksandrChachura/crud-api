import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { mockedUsers } from './setupTests.js';
import { updateUsersData, initializeUsersData } from '../db/usersData.js';

const { server } = await import('../server.js');

describe('GET /api/users', () => {
  beforeEach(async () => {
    await initializeUsersData();
    updateUsersData([...mockedUsers]);
  });

  it('should return all existing users', async () => {
    const response = await request(server).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedUsers);
  });
});
