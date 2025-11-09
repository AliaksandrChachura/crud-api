import 'dotenv/config';
import http from 'node:http';
import { handleMessage } from '../db/usersData';
import { routes } from '../routes/userRoutes';


const loadBalancerPort = Number(process.env.LOAD_BALANCER_PORT || 4000);

const createServer = (workerId?: number) => {
  process.on('message', handleMessage);

  const server = http.createServer((request, response) => {
    routes(request, response);
  });

  if (workerId) {
    const port = loadBalancerPort + workerId;
    server.listen(port, () => {
      console.log(`Worker ${process.pid} running at http://localhost:${port}/`);
    });
  } else {
    const port = loadBalancerPort;
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}/`);
    });
  }
};

export { createServer, loadBalancerPort };