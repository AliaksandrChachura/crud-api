import { Server } from 'http'
interface User {
  id: string
  username: string
  age: number
  hobbies: string[]
}

type NewUser = Omit<User, 'id'>

interface UserRequestBody {
  username: string
  age: number
  hobbies: string[]
}

interface ServerModule {
  default: Server
}

export { User, NewUser, UserRequestBody, ServerModule }
