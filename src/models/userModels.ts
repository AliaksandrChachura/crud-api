import { v4 as uuidv4, validate as uuidValidate } from 'uuid'
import { User } from '../types/index'
import { users } from '../db/inMemory'

const getAllUsers = (): User[] => Object.values(users)

const getUserById = (userId: string): User | undefined =>
  users.find((user) => user.id === userId)

const createUser = (user: Omit<User, 'id'>): User => {
  const newUser = { id: uuidv4(), ...user }
  users.push(newUser)
  return newUser
}

const updateUser = (
  userId: string,
  userUpdates: Partial<User>,
): User | null => {
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex === -1) return null
  const updatedUser = { ...users[userIndex], ...userUpdates }
  users[userIndex] = updatedUser
  return updatedUser
}

const deleteUser = (id: string): boolean => {
  const index = users.findIndex((user) => user.id === id)
  if (index === -1) return false

  users.splice(index, 1)
  return true
}

const isValidUuid = (id: string): boolean => uuidValidate(id)

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  isValidUuid,
}
