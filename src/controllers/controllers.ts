import { IncomingMessage, ServerResponse } from "http";
import { User } from "../db/types";
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { ErrorMessage, HttpStatus } from '../types';
import { getUserId, sendResponse, handleError, validateBody } from '../utils/utils';

const getUsers = (request: IncomingMessage, response: ServerResponse) => {
    if (!request.users) {
        handleError(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.InternalServerError);
        return;
    }

    sendResponse(response, HttpStatus.OK, request.users);
}

const getUser = (request: IncomingMessage, response: ServerResponse) => {
    const urlParts = request.url?.split('/').filter(part => part);
    const userId = urlParts && urlParts.length > 2 ? urlParts[2] : undefined;

    if (!request.users) {
        handleError(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.InternalServerError);
        return;
    }

    if (!userId) {
        handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
        return;
    }

    if (!uuidValidate(userId)) {
        handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
        return;
    }

    const user = request.users.find((user: User) => user.id === userId);
    
    if (!user) {
        handleError(response, HttpStatus.NOT_FOUND, ErrorMessage.UserNotFound);
        return;
    }
    
    sendResponse(response, HttpStatus.OK, user);
}

const postUser = (request: IncomingMessage, response: ServerResponse) => {
    if (!request.users) {
        handleError(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.InternalServerError);
        return;
    }

    if (!request.body) {
        handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidRequestBody);
        return;
    }

    if (!request.body.username || !request.body.age || !request.body.hobbies) {
        handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.MissingFields);
        return;
    }

    if (!validateBody(request.body, response)) {
        return;
    }

    const newUser = {
        id: uuidv4(),
        username: request.body.username,
        age: request.body.age,
        hobbies: request.body.hobbies,
    } as User;
    
    request.users.push(newUser);
    sendResponse(response, HttpStatus.CREATED, newUser);
}

const putUser = (request: IncomingMessage, response: ServerResponse) => {
    const userId = request.url?.split('/')[2];
    const user = request.users?.find((user: User) => user.id === userId);
    if (!user) {
        handleError(response, HttpStatus.NOT_FOUND, ErrorMessage.UserNotFound);
        return;
    }
    if (!request.body) {
        handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidRequestBody);
        return;
    }
    const updatedUser = {
        ...user,
        username: request.body.username,
        age: request.body.age,
        hobbies: request.body.hobbies,
    } as User;
    request.users?.splice(request.users.indexOf(user), 1, updatedUser);
    sendResponse(response, HttpStatus.OK, updatedUser);
}

const deleteUser = (request: IncomingMessage, response: ServerResponse) => {
    const userId = getUserId(request);
    
    if (!request.users) {
        handleError(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.InternalServerError);
        return;
    }

    if (!userId) {
        handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
        return;
    }

    if (!uuidValidate(userId)) {
        handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidUserId);
        return;
    }

    const user = request.users.find((user: User) => user.id === userId);
    if (!user) {
        handleError(response, HttpStatus.NOT_FOUND, ErrorMessage.UserNotFound);
        return;
    }
    
    request.users.splice(request.users.indexOf(user), 1);
    sendResponse(response, HttpStatus.NO_CONTENT, null);
}

export { getUsers, getUser, postUser, putUser, deleteUser};