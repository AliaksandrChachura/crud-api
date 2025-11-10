import http from 'node:http';
import { routes } from './routes/userRoutes';
import { initializeUsersData } from './db/usersData';
import { handleError } from './utils/utils';
import { HttpStatus, ErrorMessage } from './types';

const PORT = process.env.PORT || '4000';

const server = http.createServer(async (request, response) => {
  try {
    await routes(request, response);
  } catch (error) {
    console.error('Route error:', error);
    handleError(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.InternalServerError);
  }
});

const initServer = async () => {
  try {
    await initializeUsersData();
  } catch (error) {
    console.error('Error initializing users data:', error);
    process.exit(1);
  }

  if (process.env.NODE_ENV !== 'test') {
    await server
      .listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
      })
      .on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          console.error(
            `Port ${PORT} is already in use. Please stop the other process or use a different port.`,
          );
          console.error(`To kill the process on port ${PORT}, run: lsof -ti :${PORT} | xargs kill -9`);
        } else {
          console.error('Server error:', error);
        }
        process.exit(1);
      });
  }

  const shutdown = () => {
    console.log('\nShutting down server...');
    server.close(() => {
      console.log('Server fully stopped. Bye! 👋');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

initServer();

export { initServer, server };
