import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { mockedUsers } from './setupTests';
import { ErrorMessage } from '../types';
import { updateUsersData, initializeUsersData } from '../db/usersData';

const { server } = await import('../server.js');

describe('PUT /api/users/:id', () => {
  beforeEach(async () => {
    await initializeUsersData();
    updateUsersData([...mockedUsers]);
  });

  it('should update an existing user with valid data', async () => {
    const updatedUser = { username: 'Updated Username', age: 40, hobbies: ['dancing'] };
    const userId = mockedUsers[0].id;

    const response = await request(server).put(`/api/users/${userId}`).send(updatedUser);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: userId, ...updatedUser });
  });

  it('should return 400 when required fields are missing', async () => {
    const updatedUser = { username: 'Updated Username' };
    const userId = mockedUsers[0].id;

    const response = await request(server).put(`/api/users/${userId}`).send(updatedUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: ErrorMessage.MissingFields });
  });

  it('should return 404 for non-existent user id', async () => {
    const updatedUser = { username: 'Updated Username', age: 40, hobbies: ['dancing'] };
    const userId = '456b3fa0-c339-4c1f-84df-04027eebdf7d';

    const response = await request(server).put(`/api/users/${userId}`).send(updatedUser);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: ErrorMessage.UserNotFound });
  });

  it('should update only username field', async () => {
    const updatedUser = { username: 'New Username', age: mockedUsers[0].age, hobbies: mockedUsers[0].hobbies };
    const userId = mockedUsers[0].id;

    const response = await request(server).put(`/api/users/${userId}`).send(updatedUser);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('New Username');
    expect(response.body.age).toBe(mockedUsers[0].age);
    expect(response.body.hobbies).toEqual(mockedUsers[0].hobbies);
  });

  it('should return 400 for invalid JSON', async () => {
    const userId = mockedUsers[0].id;

    const response = await request(server)
      .put(`/api/users/${userId}`)
      .send('invalid json')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: ErrorMessage.InvalidJSON });
  });
});
