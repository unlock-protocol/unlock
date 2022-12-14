import app from '../src/app'
import net from 'net'
import config from '../config/config'
import { sleep } from './test-helpers/utils'

const connectDatabase = (host: string, port: number) => {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, host, () => {
      resolve(true)
      socket.end()
    })
    socket.on('error', () => {
      reject(false)
    })
  })
}

/**
 * This is a helper function to ensure that we start the test suite only when the server is up
 * We will retry for
 */
const serverIsUp = async (
  host: string,
  port: number,
  delay: number,
  maxAttempts: number
) => {
  let attempts = 1
  while (attempts <= maxAttempts) {
    try {
      await connectDatabase(host, port)
      return true
    } catch (e) {
      await sleep(delay)
      attempts++
    }
  }
  throw new Error('Unable to connect to database')
}

await serverIsUp(config.database.host, config.database.port, 1000, 5)

export default app
