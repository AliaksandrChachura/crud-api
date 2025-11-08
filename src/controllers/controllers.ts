import { IncomingMessage, ServerResponse } from "http";
import { UserWithoutId, User } from "../db/types";
import { request as httpRequest } from "http";
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { ErrorMessage } from '../types';

const getUsers = (request: IncomingMessage, response: ServerResponse) => {
    if (!request.users) {
        response.statusCode = 500;
        response.write('Internal server error');
        response.end();
        return;
    }

    response.statusCode = 200;
    response.write(JSON.stringify(request.users));
    response.end();
}

const getUser = (request: IncomingMessage, response: ServerResponse) => {
    const urlParts = request.url?.split('/').filter(part => part);
    const userId = urlParts && urlParts.length > 2 ? urlParts[2] : undefined;

    if (!request.users) {
        response.statusCode = 500;
        response.write('Internal server error');
        response.end();
        return;
    }

    if (!userId) {
        response.statusCode = 400;
        response.write(ErrorMessage.InvalidUserId);
        response.end();
        return;
    }

    if (!uuidValidate(userId)) {
        response.statusCode = 400;
        response.write(ErrorMessage.InvalidUserId);
        response.end();
        return;
    }

    const user = request.users.find((user: User) => user.id === userId);
    
    if (!user) {
        response.statusCode = 404;
        response.write(ErrorMessage.UserNotFound);
        response.end();
        return;
    }
    
    response.statusCode = 200;
    response.write(JSON.stringify(user));
    response.end();
}

const postUser = (request: IncomingMessage, response: ServerResponse) => {
    const userId = request.url?.split('/')[2];

    const user = request.users?.find((user: User) => user.id === userId);
    if (user) {
        response.statusCode = 400;
        response.write('user already exists');
        response.end();
        return;
    }
    if (!user) {
        if (!request.body) {
            response.statusCode = 400;
            response.write('Invalid request body');
            response.end();
            return;
        }
        const newUser = {
            id: uuidv4(),
            username: request.body.username,
            age: request.body.age,
            hobbies: request.body.hobbies,
        } as User;
        request.users?.push(newUser);
        response.statusCode = 400;
        response.write('user not found');
        response.end();
    }
    response.statusCode = 400;
    response.write(`cannot pass ${request.url}`);
    response.end();
}

const putUser = (request: IncomingMessage, response: ServerResponse) => {
    const userId = request.url?.split('/')[2];
    const user = request.users?.find((user: User) => user.id === userId);
    if (!user) {
        response.statusCode = 404;
        response.write('user not found');
        response.end();
        return;
    }
    if (!request.body) {
        response.statusCode = 400;
        response.write('Invalid request body');
        response.end();
        return;
    }
    const updatedUser = {
        ...user,
        username: request.body.username,
        age: request.body.age,
        hobbies: request.body.hobbies,
    } as User;
    request.users?.splice(request.users.indexOf(user), 1, updatedUser);
    response.statusCode = 200;
    response.write(JSON.stringify(updatedUser));
    response.end();
}

const deleteUser = (request: IncomingMessage, response: ServerResponse) => {
    const userId = request.url?.split('/')[2];
    const user = request.users?.find((user: User) => user.id === userId);
    if (!user) {
        response.statusCode = 404;
        response.write('user not found');
        response.end();
        return;
    }
    request.users?.splice(request.users.indexOf(user), 1);
    response.statusCode = 204;
    response.end();
}

export { getUsers, getUser, postUser, putUser, deleteUser};