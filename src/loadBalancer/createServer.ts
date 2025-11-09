import 'dotenv/config';
import { createServer as createHttpServer } from 'node:http';
import { routes } from '../routes/userRoutes';
import { forwardRequest } from './forwardRequest';

const loadBalancerPort = Number(process.env.LOAD_BALANCER_PORT || 4000);

const createServer = (workerId?: number) => {
  const server = createHttpServer((request, response) => {
    if (workerId) {
      routes(request, response);
    } else {
      forwardRequest(request, response);
    }
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
