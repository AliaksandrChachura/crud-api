import { ServerResponse, IncomingMessage } from 'http'
import { User } from '../types/index'

const sendJsonResponse = (
  res: ServerResponse,
  statusCode: number,
  data: object | string,
): void => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(typeof data === 'string' ? data : JSON.stringify(data))
}

const parseJsonBody = async (req: IncomingMessage): Promise<User> => {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
  })
}

export { sendJsonResponse, parseJsonBody }
