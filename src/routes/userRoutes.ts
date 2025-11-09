import { IncomingMessage, ServerResponse } from 'http';
import { getUsers, getUser, postUser, putUser, deleteUser } from '../controllers/controllers.js';
import { handleError, isValidEndpoint } from '../utils/utils.js';
import { HttpStatus, ErrorMessage } from '../types.js';

const routes = async (request: IncomingMessage, response: ServerResponse) => {
  try {
    if (!isValidEndpoint(request.url)) {
      handleError(response, HttpStatus.NOT_FOUND, ErrorMessage.EndpointNotFound);
      return;
    }

    switch (request.method) {
      case 'GET': {
        const urlParts = request.url?.split('/').filter((part) => part);
        const userId = urlParts && urlParts.length > 2 ? urlParts[2] : undefined;

        if (userId) {
          getUser(request, response);
        } else {
          getUsers(request, response);
        }
        break;
      }

      case 'POST':
        await postUser(request, response);
        break;

      case 'PUT':
        await putUser(request, response);
        break;

      case 'DELETE':
        await deleteUser(request, response);
        break;

      default:
        handleError(response, HttpStatus.BAD_REQUEST, ErrorMessage.InvalidRequestBody);
    }
  } catch (error) {
    console.error('Route error:', error);
    handleError(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.InternalServerError);
  }
};

export { routes };
