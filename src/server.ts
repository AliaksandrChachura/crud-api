import http, { IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  isValidUuid,
} from './models/userModel'