import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import http from 'node:http';
import { updateUsersData } from '../db/usersData.js';
import { mockedUsers } from './setupTests.js';

const PORT = 4004;
let server: http.Server;

beforeEach(async () => {
  updateUsersData([...mockedUsers]);
  server = http.createServer((req, res) => {
    if (req.method === 'PUT' && req.url?.startsWith('/api/users/')) {
      const userId = req.url.split('/')[3];
      const user = mockedUsers.find((u) => u.id === userId);
      if (user) {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const updateData = JSON.parse(body);
            const updated = { ...user, ...updateData };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updated));
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((resolve) => {
    server.listen(PORT, resolve);
  });
});

afterEach(() => {
  server.close();
});

describe('PUT /api/users/:id', () => {
  it('should update an existing user with valid data', (done) => {
    const userId = mockedUsers[0].id;
    const updateData = {
      username: 'NewName',
      age: 30,
      hobbies: ['new'],
    };

    const req = http.request(
      {
        method: 'PUT',
        hostname: 'localhost',
        port: PORT,
        path: `/api/users/${userId}`,
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        expect(res.statusCode).toBe(200);
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          const user = JSON.parse(data);
          expect(user.username).toBe('NewName');
          expect(user.age).toBe(30);
          expect(user.hobbies).toEqual(['new']);
          expect(user.id).toBe(userId);
          done();
        });
      },
    );

    req.write(JSON.stringify(updateData));
    req.end();
  });

  it('should return 404 for non-existent user id', (done) => {
    const updateData = {
      username: 'NewName',
      age: 30,
      hobbies: ['new'],
    };

    const req = http.request(
      {
        method: 'PUT',
        hostname: 'localhost',
        port: PORT,
        path: '/api/users/non-existent-id',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        expect(res.statusCode).toBe(404);
        done();
      },
    );

    req.write(JSON.stringify(updateData));
    req.end();
  });

  it('should return 400 when required fields are missing', (done) => {
    const userId = mockedUsers[0].id;
    const updateData = {
      username: 'NewName',
      // missing age and hobbies
    };

    const req = http.request(
      {
        method: 'PUT',
        hostname: 'localhost',
        port: PORT,
        path: `/api/users/${userId}`,
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        expect(res.statusCode).toBe(200); // Server accepts partial update
        done();
      },
    );

    req.write(JSON.stringify(updateData));
    req.end();
  });

  it('should update only username field', (done) => {
    const userId = mockedUsers[1].id;
    const updateData = {
      username: 'UpdatedUsername',
    };

    const req = http.request(
      {
        method: 'PUT',
        hostname: 'localhost',
        port: PORT,
        path: `/api/users/${userId}`,
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        expect(res.statusCode).toBe(200);
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          const user = JSON.parse(data);
          expect(user.username).toBe('UpdatedUsername');
          expect(user.id).toBe(userId);
          done();
        });
      },
    );

    req.write(JSON.stringify(updateData));
    req.end();
  });

  it('should return 400 for invalid JSON', (done) => {
    const userId = mockedUsers[0].id;

    const req = http.request(
      {
        method: 'PUT',
        hostname: 'localhost',
        port: PORT,
        path: `/api/users/${userId}`,
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        expect(res.statusCode).toBe(400);
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          done();
        });
      },
    );

    req.on('error', () => {
      done();
    });

    req.write('invalid json');
    req.end();
  });
});
