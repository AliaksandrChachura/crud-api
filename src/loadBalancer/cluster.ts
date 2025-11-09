import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import { getUsersData, initializeUsersData } from '../db/usersData';
import { createServer } from './createServer';
import { User } from '../db/types';

const PORT = Number(process.env.PORT || '4000');
const numCPUs = availableParallelism();
const numWorkers = numCPUs - 1;

if (process.env.MULTI === 'true') {
  if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);

    // Initialize users data in primary process
    initializeUsersData().catch(console.error);

    // Fork workers (numCPUs - 1 workers)
    const workers: Array<{ worker: ReturnType<typeof cluster.fork>; id: number }> = [];
    for (let i = 1; i <= numWorkers; i++) {
      try {
        const worker = cluster.fork({ env: { ...process.env, WORKER_ID: String(i) } });

        // Handle worker errors - prevent EPIPE from crashing primary
        worker.on('error', (error: Error & { code?: string }) => {
          if (error.code !== 'EPIPE') {
            console.error(`Worker ${i} error:`, error);
          }
          // Don't crash on EPIPE - worker might have exited
        });

        // Wait for worker to be online before adding to array
        worker.on('online', () => {
          console.log(`Worker ${i} (PID: ${worker.process.pid}) is online`);
        });

        // Handle worker disconnect
        worker.on('disconnect', () => {
          console.log(`Worker ${i} disconnected`);
        });

        workers.push({ worker, id: i });
      } catch (error) {
        console.error(`Failed to fork worker ${i}:`, error);
      }
    }

    // Round-robin load balancer
    let currentWorkerIndex = 0;
    const loadBalancer = http.createServer(async (request, response) => {
      // Get next worker using Round-robin
      const workerInfo = workers[currentWorkerIndex];
      currentWorkerIndex = (currentWorkerIndex + 1) % workers.length;

      if (!workerInfo) {
        response.statusCode = 503;
        response.write('No workers available');
        response.end();
        return;
      }

      // Forward request to worker
      const workerPort = PORT + workerInfo.id;
      const options = {
        hostname: 'localhost',
        port: workerPort,
        path: request.url,
        method: request.method,
        headers: request.headers,
      };

      const proxyRequest = http.request(options, (proxyResponse) => {
        response.writeHead(proxyResponse.statusCode || 200, proxyResponse.headers);
        proxyResponse.pipe(response);
      });

      proxyRequest.on('error', (error) => {
        console.error('Proxy error:', error);
        response.statusCode = 502;
        response.write('Bad Gateway');
        response.end();
      });

      // Forward request body for POST/PUT requests
      request.pipe(proxyRequest);
    });

    loadBalancer.listen(PORT, () => {
      console.log(`Load balancer is running on port ${PORT}`);
    });

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker process ${worker.process.pid} died with code ${code} and signal ${signal}`);
      const index = workers.findIndex((w) => w.worker.id === worker.id);
      if (index !== -1) {
        const workerId = workers[index].id;
        // Only restart if exit code is not 1 (which might indicate a startup error)
        if (code !== 1) {
          console.log(`Restarting worker ${workerId}...`);
          try {
            const newWorker = cluster.fork({ env: { ...process.env, WORKER_ID: String(workerId) } });

            // Handle new worker errors - prevent EPIPE from crashing primary
            newWorker.on('error', (error: Error & { code?: string }) => {
              if (error.code !== 'EPIPE') {
                console.error(`Restarted worker ${workerId} error:`, error);
              }
            });

            newWorker.on('online', () => {
              console.log(`Restarted worker ${workerId} (PID: ${newWorker.process.pid}) is online`);
            });

            newWorker.on('disconnect', () => {
              console.log(`Restarted worker ${workerId} disconnected`);
            });

            workers[index] = { worker: newWorker, id: workerId };
          } catch (error) {
            console.error(`Failed to restart worker ${workerId}:`, error);
          }
        } else {
          console.log(`Worker ${workerId} exited with code 1, not restarting (likely startup error)`);
        }
      }
    });

    // Broadcast database updates to all workers
    cluster.on('message', async (worker, message: { type?: string }) => {
      if (message.type === 'dbUpdated') {
        // Reload data from file to get latest state
        await initializeUsersData();
        const updatedData = getUsersData();
        Object.values(cluster.workers!).forEach((w) => {
          if (w && w.isConnected()) {
            try {
              w.send({ type: 'updatedDB', data: updatedData });
            } catch (error) {
              console.error(`Error sending message to worker ${w.id}:`, error);
            }
          }
        });
      }
    });
  } else {
    // Worker process
    const workerId = Number(process.env.WORKER_ID);

    if (!workerId || isNaN(workerId)) {
      console.error('Worker ID is not set or invalid');
      // Give time for IPC to establish before exiting
      setTimeout(() => process.exit(1), 200);
    } else {
      console.log(`Worker process ${process.pid} is running on port ${PORT + workerId}`);

      // Listen for database updates from primary
      process.on('message', async (message: { type?: string; data?: unknown }) => {
        if (message && message.type === 'updatedDB') {
          // Update local database state
          const { updateUsersData } = await import('../db/usersData');
          updateUsersData(message.data as User[]);
        }
      });

      // Handle uncaught errors gracefully
      process.on('uncaughtException', (error) => {
        console.error('Worker uncaught exception:', error);
        // Don't exit immediately - let the error be logged
      });

      process.on('unhandledRejection', (reason) => {
        console.error('Worker unhandled rejection:', reason);
      });

      createServer(workerId).catch((error) => {
        console.error('Error creating server:', error);
        // Give time for IPC to establish before exiting
        setTimeout(() => process.exit(1), 200);
      });
    }
  }
} else {
  createServer().catch(console.error);
}
