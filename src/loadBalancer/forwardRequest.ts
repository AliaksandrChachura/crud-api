import http, { IncomingMessage, RequestOptions, ServerResponse } from 'node:http';
import { ErrorMessage, HttpMethod, HttpStatus } from '../types';
import { sendResponse } from '../utils/utils';
import { loadBalancerPort } from './createServer';
import { availableParallelism } from 'node:os';

const numCPUs = availableParallelism();
const workersCount = Math.max(1, numCPUs - 1);

let currentServerIndex = 1;

export const forwardRequest = (req: IncomingMessage, res: ServerResponse) => {
  const port = loadBalancerPort + currentServerIndex;

  console.log(`Forwarding request to server ${currentServerIndex} on port ${port}`);

  const options: RequestOptions = {
    hostname: 'localhost',
    port,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const requestToServer = http.request(options, (responseFromServer) => {
    res.writeHead(
      responseFromServer.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      responseFromServer.headers,
    );
    responseFromServer.pipe(res);
  });

  requestToServer.on('error', (err) => {
    sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, {
      message: `${ErrorMessage.InternalServerError}: ${(err as Error).message}`,
    });
  });

  if (req.method === HttpMethod.POST || req.method === HttpMethod.PUT) {
    req.pipe(requestToServer);
  } else {
    requestToServer.end();
  }

  currentServerIndex = (currentServerIndex % workersCount) + 1;
};
