import http from 'http'
import { parse } from 'url'
import {
  handleGetUsers,
  handleGetUserById,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
} from './apis/usersApi'
import { sendJsonResponse } from './utils/httpUtils'

const requestListener: http.RequestListener = (req, res) => {
  const parsedUrl = parse(req.url!, true)
  const path = parsedUrl.pathname ?? '/'
  const paths = path.split('/').filter(Boolean)

  // CORS headers for simplicity in testing
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, DELETE',
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Route: GET /api/users (List all users)
  if (
    req.method === 'GET' &&
    paths[0] === 'api' &&
    paths[1] === 'users' &&
    paths.length === 2
  ) {
    handleGetUsers(req, res)
  }

  // Route: GET /api/users/{userId} (Get a single user)
  else if (
    req.method === 'GET' &&
    paths[0] === 'api' &&
    paths[1] === 'users' &&
    paths.length === 3
  ) {
    const userId = paths[2]
    handleGetUserById(req, res, userId)
  }

  // Route: POST /api/users (Create a new user)
  else if (
    req.method === 'POST' &&
    paths[0] === 'api' &&
    paths[1] === 'users'
  ) {
    handleCreateUser(req, res)
  }

  // Route: PUT /api/users/{userId} (Update an existing user)
  else if (
    req.method === 'PUT' &&
    paths[0] === 'api' &&
    paths[1] === 'users' &&
    paths.length === 3
  ) {
    const userId = paths[2]
    handleUpdateUser(req, res, userId)
  }

  // Route: DELETE /api/users/{userId} (Delete a user)
  else if (
    req.method === 'DELETE' &&
    paths[0] === 'api' &&
    paths[1] === 'users' &&
    paths.length === 3
  ) {
    const userId = paths[2]
    handleDeleteUser(req, res, userId)
  }

  // Handle non-existing routes
  else {
    sendJsonResponse(res, 404, { message: 'Not Found' })
    return
  }
}

const server = http.createServer(requestListener)
const PORT = process.env.PORT ?? 3000

server.listen(PORT, () => console.log(`Server is running on ${PORT}`))
