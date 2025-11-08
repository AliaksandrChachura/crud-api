import { IncomingMessage, request, ServerResponse } from "http";
import { getUsers, getUser, postUser, putUser, deleteUser } from "../controllers/controllers";

const routes = (request: IncomingMessage, response: ServerResponse) => {
    try {
        switch (request.method) {
            case 'GET':
                const urlParts = request.url?.split('/').filter(part => part);
                const userId = urlParts && urlParts.length > 2 ? urlParts[2] : undefined;
                
                if (userId) {
                    getUser(request, response);
                } else {
                    getUsers(request, response);
                }
                break;

            case 'POST':
                postUser(request, response);
                break;

            case 'PUT':
                putUser(request, response);
                break;

            case 'DELETE':
                deleteUser(request, response);
                break;

            default:
                response.statusCode = 400
                response.write("No Response")
                response.end()

        }
    } catch (error) {
        console.log(error)
    }
}

export { routes };