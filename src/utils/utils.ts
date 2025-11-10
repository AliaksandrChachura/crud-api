import { IncomingMessage, ServerResponse } from 'node:http';
import { HttpStatus, ErrorMessage } from '../types';
import { UserWithoutId, User } from '../db/types';
import { readFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getUserId = (request: IncomingMessage) => {
  if (!request.url) return undefined;

  const urlPath = request.url.split('?')[0];
  const urlParts = urlPath.split('/').filter((part) => part);
  const userId = urlParts && urlParts.length > 2 ? urlParts[2] : undefined;
  return userId;
};

const isValidEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;

  const urlPath = url.split('?')[0];
  const urlParts = urlPath.split('/').filter((part) => part);

  if (urlParts.length >= 2 && urlParts[0] === 'api' && urlParts[1] === 'users') {
    return true;
  }

  return false;
};

const parseBody = (request: IncomingMessage): Promise<UserWithoutId | null> => {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });

    request.on('end', () => {
      try {
        if (!body) {
          resolve(null);
          return;
        }
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
};

const handleError = (response: ServerResponse, statusCode: HttpStatus, errorMessage: ErrorMessage) => {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.statusCode = statusCode;
  response.write(JSON.stringify({ error: errorMessage }));
  response.end();
};

const sendResponse = (response: ServerResponse, statusCode: HttpStatus, data: unknown) => {
  response.statusCode = statusCode;

  if (statusCode === HttpStatus.NO_CONTENT || data === null) {
    response.end();
    return;
  }

  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(data));
  response.end();
};

const validateBody = (body: UserWithoutId, response: ServerResponse) => {
  if (!body) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidRequestBody);
    return false;
  }

  if (!body.username || !body.age || !body.hobbies) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.MissingFields);
    return false;
  }
  if (typeof body.username !== 'string') {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUsername);
    return false;
  }
  if (typeof body.age !== 'number') {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidAge);
    return false;
  }
  if (!Array.isArray(body.hobbies) || !body.hobbies.every((h: unknown) => typeof h === 'string')) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidHobbies);
    return false;
  }

  return true;
};

const getUsersDataPath = () => {
  return join(__dirname, '../db/usersData.json');
};

const readUsersFromFile = async (): Promise<User[]> => {
  try {
    const filePath = getUsersDataPath();
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch {
    return [];
  }
};

const writeUsersToFile = async (users: User[]): Promise<void> => {
  try {
    const filePath = getUsersDataPath();
    const data = JSON.stringify(users, null, 2);
    const readable = Readable.from([data]);
    const writable = createWriteStream(filePath, { encoding: 'utf-8' });
    await pipeline(readable, writable);
  } catch (error) {
    console.error('Error writing users to file:', error);
    throw error;
  }
};

export {
  getUserId,
  isValidEndpoint,
  parseBody,
  sendResponse,
  handleError,
  validateBody,
  readUsersFromFile,
  writeUsersToFile,
};
