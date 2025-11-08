import http, { request } from 'node:http';
import { routes } from './routes/userRoutes';
import { usersData } from './db/usersData';
import { User } from './db/types';
import { parseBody, handleError } from './utils/utils';
import { HttpStatus, ErrorMessage } from './types';

const PORT = process.env.PORT || '4000';

const server = http.createServer(async (request, response) => {
  request.users = usersData as User[];

  // Parse body for POST and PUT requests
  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const body = await parseBody(request);
      request.body = body || undefined;
    } catch (error) {
      handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidJSON);
      return;
    }
  }

  routes(request, response);
});

// server.on('request', (request, response) => {
//   routes(request, response);
// })

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const shutdown = () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server fully stopped. Bye! 👋');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);

process.on('SIGTERM', shutdown);