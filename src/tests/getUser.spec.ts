import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import http from 'node:http';
import { updateUsersData } from '../db/usersData.js';
import { mockedUsers } from './setupTests.js';

const PORT = 4003;
let server: http.Server;

beforeEach(async () => {
  updateUsersData(mockedUsers);
  server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url?.startsWith('/api/users/')) {
      const userId = req.url.split('/')[3];
      const user = mockedUsers.find((u) => u.id === userId);
      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
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

describe('GET /api/users/:id', () => {
  it('should return a specific user by valid id', (done) => {
    const userId = mockedUsers[0].id;
    const req = http.get(`http://localhost:${PORT}/api/users/${userId}`, (res) => {
      expect(res.statusCode).toBe(200);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        const user = JSON.parse(data);
        expect(user.id).toBe(userId);
        expect(user.username).toBe('Ali');
        done();
      });
    });
    req.on('error', (err) => {
      done(err);
    });
  });

  it('should return 404 for non-existent user id', (done) => {
    const req = http.get(`http://localhost:${PORT}/api/users/non-existent-id`, (res) => {
      expect(res.statusCode).toBe(404);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        const error = JSON.parse(data);
        expect(error.error).toBe('User not found');
        done();
      });
    });
    req.on('error', (err) => {
      done(err);
    });
  });

  it('should return user with all required fields', (done) => {
    const userId = mockedUsers[1].id;
    const req = http.get(`http://localhost:${PORT}/api/users/${userId}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        const user = JSON.parse(data);
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('age');
        expect(user).toHaveProperty('hobbies');
        done();
      });
    });
    req.on('error', (err) => {
      done(err);
    });
  });

  it('should return correct user data for different ids', (done) => {
    const userId = mockedUsers[2].id;
    const req = http.get(`http://localhost:${PORT}/api/users/${userId}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        const user = JSON.parse(data);
        expect(user.username).toBe('AliBaba');
        expect(user.age).toBe(45);
        expect(user.hobbies).toEqual(['runnin', 'jogging', 'maga']);
        done();
      });
    });
    req.on('error', (err) => {
      done(err);
    });
  });

  it('should return 404 for invalid UUID format', (done) => {
    const req = http.get(`http://localhost:${PORT}/api/users/invalid-uuid`, (res) => {
      expect(res.statusCode).toBe(404);
      res.on('data', () => {});
      res.on('end', () => {
        done();
      });
    });
    req.on('error', (err) => {
      done(err);
    });
  });
});
