import { UserWithoutId, User } from './db/types';

declare module 'http' {
  interface IncomingMessage {
    users?: User[];
    body?: UserWithoutId;
  }
}

enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

enum ErrorMessage {
  InternalServerError = 'Internal Server Error',
  InvalidRequestUrl = 'Invalid request URL: No user ID provided',
  InvalidRequestBody = 'Invalid request body',
  InvalidUserId = 'Invalid user ID (Not a valid UUID)',
  UserNotFound = 'User not found',
  MissingFields = 'Request body must contain username, age, and hobbies',
  InvalidUsername = 'Invalid username type, string expected',
  InvalidAge = 'Invalid age type, number expected',
  InvalidHobbies = 'Invalid hobbies type, array of strings expected',
  UserAlreadyExists = 'User already exists',
  InvalidJSON = 'Invalid JSON in request body',
  EndpointNotFound = 'Endpoint not found',
}

export { HttpStatus, HttpMethod, ErrorMessage };
