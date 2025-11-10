import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import {
  getUsersData,
  initializeUsersData,
  updateUsersData,
  handleMessage as handleMessageFromDB,
} from '../db/usersData';
import { createServer } from './createServer';
import { Message } from '../db/types';

const numCPUs = availableParallelism();
const workersCount = Math.max(1, numCPUs - 1);

if (process.env.MULTI === 'true') {
  if (cluster.isPrimary) {
    await initializeUsersData();
    console.log(`Primary process ${process.pid} is running`);
    console.log(`Spawning ${workersCount} workers...`);

    for (let i = 1; i <= workersCount; i++) {
      cluster.fork({ WORKER_ID: i.toString() });
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.id} died with code ${code} and signal ${signal}`);
      cluster.fork({ WORKER_ID: worker.id.toString() });
    });

    cluster.on('message', (_worker, message: Message) => {
      if (!message) return;

      updateUsersData(message.data);

      const snapshot = getUsersData();

      Object.values(cluster.workers! || {}).forEach((worker) => {
        if (worker && worker.isConnected()) {
          worker.send({ type: 'updatedDB', data: snapshot });
        }
      });
    });

    createServer();
  } else {
    process.on('message', (message: Message) => handleMessageFromDB(message as Message));

    const workerId = Number(process.env.WORKER_ID);
    createServer(workerId);
  }
} else {
  await initializeUsersData();
  createServer();
}
