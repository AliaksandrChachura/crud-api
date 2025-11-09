import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import http from 'node:http';
import { updateUsersData } from '../db/usersData.js';
import { mockedUsers } from './setupTests.js';

const PORT = 4005;
let server: http.Server;

beforeEach(async () => {
  updateUsersData([...mockedUsers]);
  server = http.createServer((req, res) => {
    if (req.method === 'DELETE' && req.url?.startsWith('/api/users/')) {
      const userId = req.url.split('/')[3];
      const user = mockedUsers.find((u) => u.id === userId);
      if (user) {
        res.writeHead(204);
        res.end();
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

describe('DELETE /api/users/:id', () => {
  it('should delete a user and return 204 status', (done) => {
    const userId = mockedUsers[0].id;
    const req = http.request(
      {
        method: 'DELETE',
        hostname: 'localhost',
        port: PORT,
        path: `/api/users/${userId}`,
      },
      (res) => {
        expect(res.statusCode).toBe(204);
        res.on('data', () => {});
        res.on('end', () => {
          done();
        });
      },
    );
    req.on('error', (err) => {
      done(err);
    });
    req.end();
  });

  it('should return 404 for non-existent user id', (done) => {
    const req = http.request(
      {
        method: 'DELETE',
        hostname: 'localhost',
        port: PORT,
        path: '/api/users/non-existent-id',
      },
      (res) => {
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
      },
    );
    req.on('error', (err) => {
      done(err);
    });
    req.end();
  });

  it('should return 204 with no response body', (done) => {
    const userId = mockedUsers[1].id;
    const req = http.request(
      {
        method: 'DELETE',
        hostname: 'localhost',
        port: PORT,
        path: `/api/users/${userId}`,
      },
      (res) => {
        expect(res.statusCode).toBe(204);
        let data = '';
        res.on('data', () => {
          data += 'should not have data';
        });
        res.on('end', () => {
          expect(data).toBe('');
          done();
        });
      },
    );
    req.on('error', (err) => {
      done(err);
    });
    req.end();
  });

  it('should delete different users by their ids', (done) => {
    const userId = mockedUsers[2].id;
    const req = http.request(
      {
        method: 'DELETE',
        hostname: 'localhost',
        port: PORT,
        path: `/api/users/${userId}`,
      },
      (res) => {
        expect(res.statusCode).toBe(204);
        res.on('data', () => {});
        res.on('end', () => {
          done();
        });
      },
    );
    req.on('error', (err) => {
      done(err);
    });
    req.end();
  });

  it('should return 404 for invalid UUID format', (done) => {
    const req = http.request(
      {
        method: 'DELETE',
        hostname: 'localhost',
        port: PORT,
        path: '/api/users/invalid-uuid-format',
      },
      (res) => {
        expect(res.statusCode).toBe(404);
        res.on('data', () => {});
        res.on('end', () => {
          done();
        });
      },
    );
    req.on('error', (err) => {
      done(err);
    });
    req.end();
  });
});
