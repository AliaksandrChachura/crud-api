import http from 'node:http';
import { routes } from '../routes/userRoutes';
import { getUsersData, initializeUsersData } from '../db/usersData';
import { parseBody, handleError } from '../utils/utils';
import { HttpStatus, ErrorMessage } from '../types';

const PORT = process.env.PORT || '4000';

const createServer = async (workerId?: number) => {
  try {
    await initializeUsersData();
  } catch (error) {
    console.error('Error initializing users data:', error);
    // Give some time for IPC to establish before exiting
    setTimeout(() => process.exit(1), 100);
    return;
  }

  const server = http.createServer(async (request, response) => {
    request.users = getUsersData();

    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        const body = await parseBody(request);
        request.body = body || undefined;
      } catch {
        handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidJSON);
        return;
      }
    }

    await routes(request, response);
  });

  if (workerId && !isNaN(workerId)) {
    const port = Number(PORT) + workerId;
    server
      .listen(port, () => {
        console.log(`Worker ${workerId} is running on port ${port}`);
      })
      .on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use for worker ${workerId}`);
        } else {
          console.error('Server error:', error);
        }
        // Give some time for IPC to establish before exiting
        setTimeout(() => process.exit(1), 100);
      });
  } else {
    server
      .listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      })
      .on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          console.error(
            `Port ${PORT} is already in use. Please stop the other process or use a different port.`,
          );
        } else {
          console.error('Server error:', error);
        }
        // Give some time for IPC to establish before exiting
        setTimeout(() => process.exit(1), 100);
      });
  }
};

export { createServer };
