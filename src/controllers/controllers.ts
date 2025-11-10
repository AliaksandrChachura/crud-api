import { IncomingMessage, ServerResponse } from 'http';
import { User } from '../db/types';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { ErrorMessage, HttpStatus } from '../types';
import {
  getUserId,
  sendResponse,
  handleError,
  validateBody,
  writeUsersToFile,
  parseBody,
} from '../utils/utils';
import { getUsersData, updateUsersData } from '../db/usersData';
import { sendDbChangedMessage } from '../loadBalancer/sendUpdatedDB';

const getUsers = (_request: IncomingMessage, response: ServerResponse) => {
  const users = getUsersData();
  sendResponse(response, HttpStatus.OK, users);
};

const getUser = (request: IncomingMessage, response: ServerResponse) => {
  const users = getUsersData();
  const userId = getUserId(request);

  if (!userId) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
    return;
  }

  if (!uuidValidate(userId)) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
    return;
  }

  const user = users.find((user: User) => user.id === userId);

  if (!user) {
    handleError(response, HttpStatus.NOT_FOUND, ErrorMessage.UserNotFound);
    return;
  }

  sendResponse(response, HttpStatus.OK, user);
};

const postUser = async (request: IncomingMessage, response: ServerResponse) => {
  const users = getUsersData();
  // if (!users) {
  //   handleError(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.InternalServerError);
  //   return;
  // }
  let body;
  try {
    body = await parseBody(request);
  } catch {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidRequestBody);
    return;
  }
  if (!body) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidRequestBody);
    return;
  }

  if (!validateBody(body, response)) {
    return;
  }

  const newUser = {
    id: uuidv4(),
    username: body.username,
    age: body.age,
    hobbies: body.hobbies,
  } as User;

  users.push(newUser);
  await writeUsersToFile(users);
  updateUsersData(users);
  sendDbChangedMessage(users);

  sendResponse(response, HttpStatus.CREATED, newUser);
};

const putUser = async (request: IncomingMessage, response: ServerResponse) => {
  const users = getUsersData();

  const userId = getUserId(request);

  if (!userId) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
    return;
  }

  if (!uuidValidate(userId)) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
    return;
  }

  const user = users.find((user: User) => user.id === userId);

  if (!user) {
    handleError(response, HttpStatus.NOT_FOUND, ErrorMessage.UserNotFound);
    return;
  }

  let body;
  try {
    body = await parseBody(request);
  } catch {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidJSON);
    return;
  }
  if (!body) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidRequestBody);
    return;
  }

  if (!validateBody(body, response)) {
    return;
  }
  const updatedUser = {
    ...user,
    username: body.username,
    age: body.age,
    hobbies: body.hobbies,
  } as User;

  users.splice(users.indexOf(user), 1, updatedUser);
  await writeUsersToFile(users);
  updateUsersData(users);

  sendDbChangedMessage(users);

  sendResponse(response, HttpStatus.OK, updatedUser);
};

const deleteUser = async (request: IncomingMessage, response: ServerResponse) => {
  const users = getUsersData();
  const userId = getUserId(request);

  if (!userId) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
    return;
  }

  if (!uuidValidate(userId)) {
    handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
    return;
  }

  const user = users.find((user: User) => user.id === userId);
  if (!user) {
    handleError(response, HttpStatus.NOT_FOUND, ErrorMessage.UserNotFound);
    return;
  }

  users.splice(users.indexOf(user), 1);
  await writeUsersToFile(users);
  updateUsersData(users);
  sendDbChangedMessage(users);

  sendResponse(response, HttpStatus.NO_CONTENT, null);
};

export { getUsers, getUser, postUser, putUser, deleteUser };
