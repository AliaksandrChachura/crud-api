import http, { request } from 'node:http';
import { routes } from './routes/userRoutes';
import { usersData } from './db/usersData';
import { User } from './db/types';
import './types';

const PORT = process.env.PORT || '4000';

const server = http.createServer((request, response) => {

  request.users = usersData as User[];

  routes(request, response);
  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/plain');
  // res.write('Hello World');
  // res.end();
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