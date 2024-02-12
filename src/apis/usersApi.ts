import { IncomingMessage, ServerResponse } from 'http'
import * as UserModel from '../models/userModels'
import { parseJsonBody, sendJsonResponse } from '../utils/httpUtils'

export const handleGetUsers = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const users = UserModel.getUsers()
  sendJsonResponse(res, 200, users)
}

export const handleGetUserById = async (
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

export const handleCreateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
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
};

export const handleUpdateUser = async (
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

export const handleDeleteUser = async (
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
