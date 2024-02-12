import { IncomingMessage, ServerResponse } from 'http'
import * as UserModel from '../models/userModels'
import { parseJsonBody, sendJsonResponse } from '../utils/httpUtils'

const handleGetUsers = async (req: IncomingMessage, res: ServerResponse) => {
  const users = UserModel.getAllUsers()
  sendJsonResponse(res, 200, users)
}

const handleGetUserById = async (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!UserModel.isValidUuid(userId)) {
    sendJsonResponse(res, 400, { message: 'Invalid user ID format' })
    return
  }
  const user = UserModel.getUserById(userId)
  if (!user) {
    sendJsonResponse(res, 404, { message: 'User not found' })
    return
  }
  sendJsonResponse(res, 200, user)
}

const handleCreateUser = async (req: IncomingMessage, res: ServerResponse) => {
  const userData = await parseJsonBody(req)
  if (
    !userData.username ||
    userData.age === undefined ||
    !Array.isArray(userData.hobbies)
  ) {
    sendJsonResponse(res, 400, { message: 'Missing required fields' })
    return
  }
  const newUser = UserModel.createUser(userData)
  sendJsonResponse(res, 201, newUser)
}

const handleUpdateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!UserModel.isValidUuid(userId)) {
    sendJsonResponse(res, 400, { message: 'Invalid user ID format' })
    return
  }
  const userData = await parseJsonBody(req)
  const updatedUser = UserModel.updateUser(userId, userData)
  if (!updatedUser) {
    sendJsonResponse(res, 404, { message: 'User not found' })
    return
  }
  sendJsonResponse(res, 200, updatedUser)
}

const handleDeleteUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!UserModel.isValidUuid(userId)) {
    sendJsonResponse(res, 400, { message: 'Invalid user ID format' })
    return
  }
  const deleted = UserModel.deleteUser(userId)
  if (!deleted) {
    sendJsonResponse(res, 404, { message: 'User not found' })
    return
  }
  res.writeHead(204)
}

export {
  handleGetUsers,
  handleGetUserById,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
}
