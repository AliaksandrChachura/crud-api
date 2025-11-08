import { IncomingMessage, ServerResponse } from "node:http";
import { HttpStatus, ErrorMessage } from "../types";
import { UserWithoutId } from "../db/types";

const getUserId = (request: IncomingMessage) => {
    const urlParts = request.url?.split('/').filter(part => part);
    const userId = urlParts && urlParts.length > 2 ? urlParts[2] : undefined;
    return userId;
}

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
}

const handleError = (response: ServerResponse, statusCode: HttpStatus, errorMessage: ErrorMessage) => {
    response.writeHead(statusCode, { 'Content-Type': 'application/json' });
    response.statusCode = statusCode;
    response.write(JSON.stringify({ error: errorMessage }));
    response.end();
}

const sendResponse = (response: ServerResponse, statusCode: HttpStatus, data: unknown) => {
    response.statusCode = statusCode;
    
    if (statusCode === HttpStatus.NO_CONTENT || data === null) {
        response.end();
        return;
    }
    
    response.writeHead(statusCode, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(data));
    response.end();
}

const validateBody = (body: UserWithoutId, response: ServerResponse) => {
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
}

export { getUserId, parseBody, sendResponse, handleError, validateBody };