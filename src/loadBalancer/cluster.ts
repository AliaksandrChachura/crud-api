import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { getUsersData, initializeUsersData } from '../db/usersData';
import { createServer } from './createServer';
import { User, Message } from '../db/types';
import { handleMessage } from '../db/usersData';
const PORT = Number(process.env.PORT || '4000');

const numCPUs = availableParallelism();

if (process.env.MULTI === 'true') {
  if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);

    for (let i = 1; i <= numCPUs; i++) {
        cluster.fork({ WORKER_ID: i });

      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.id} died with code ${code} and signal ${signal}`);
        cluster.fork({ WORKER_ID: worker.id });
      });

      cluster.on('message', (worker, message: Message) => {
        handleMessage(message as Message);

        Object.values(cluster.workers!).forEach((worker) => {
          if (worker && worker.isConnected()) {
            worker.send({ type: 'updatedDB', data: getUsersData() });
          }
        })
      });

      createServer();
    } else {
        process.on('message', (message: Message) => handleMessage(message as Message));

        createServer(Number(process.env.WORKER_ID));
    }
}
