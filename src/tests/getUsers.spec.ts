import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import http from 'node:http';
import { updateUsersData, getUsersData } from '../db/usersData.js';
import { mockedUsers } from './setupTests.js';

const PORT = 4002;
let server: http.Server;

beforeEach(async () => {
  updateUsersData([...mockedUsers]);
  server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/users') {
      const users = getUsersData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
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

describe('GET /api/users', () => {
  it('should return all users as an array', (done) => {
    const req = http.get(`http://localhost:${PORT}/api/users`, (res) => {
      expect(res.statusCode).toBe(200);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        const users = JSON.parse(data);
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBe(4);
        done();
      });
    });
    req.on('error', (err) => {
      done(err);
    });
  });

  it('should return users with correct structure', (done) => {
    const req = http.get(`http://localhost:${PORT}/api/users`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        const users = JSON.parse(data);
        users.forEach((user: any) => {
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('username');
          expect(user).toHaveProperty('age');
          expect(user).toHaveProperty('hobbies');
          expect(Array.isArray(user.hobbies)).toBe(true);
        });
        done();
      });
    });
    req.on('error', (err) => {
      done(err);
    });
  });

  it('should return empty array when no users exist', (done) => {
    // Close current server and create new one with empty data
    server.close(() => {
      updateUsersData([]);
      const emptyServer = http.createServer((req, res) => {
        if (req.method === 'GET' && req.url === '/api/users') {
          const users = getUsersData();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(users));
        } else {
          res.writeHead(404);
          res.end();
        }
      });
      emptyServer.listen(PORT, () => {
        const req = http.get(`http://localhost:${PORT}/api/users`, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk.toString();
          });
          res.on('end', () => {
            const users = JSON.parse(data);
            expect(Array.isArray(users)).toBe(true);
            expect(users.length).toBe(0);
            emptyServer.close();
            done();
          });
        });
        req.on('error', (err) => {
          emptyServer.close();
          done(err);
        });
      });
    });
  });

  it('should return correct Content-Type header', (done) => {
    const req = http.get(`http://localhost:${PORT}/api/users`, (res) => {
      expect(res.headers['content-type']).toContain('application/json');
      res.on('data', () => {});
      res.on('end', () => {
        done();
      });
    });
    req.on('error', (err) => {
      done(err);
    });
  });

  it('should return all users with their complete data', (done) => {
    const req = http.get(`http://localhost:${PORT}/api/users`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        const users = JSON.parse(data);
        expect(users[0].username).toBe('Ali');
        expect(users[0].age).toBe(47);
        expect(users[2].username).toBe('AliBaba');
        expect(users[3].username).toBe('Alex');
        done();
      });
    });
    req.on('error', (err) => {
      done(err);
    });
  });
});
