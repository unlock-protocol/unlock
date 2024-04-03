import app from './app'
import logger from './logger'

logger.info('Starting Locksmith...')

process.on('uncaughtException', function (error, origin) {
  logger.error('Fatal error:', origin)
  logger.error(error.toString())
  logger.error(error.stack)
  process.exit(1)
})

const port = process.env.PORT || 8080

// in prod, we start immediately
logger.info(`Listening on ${port}`)
const server = app.listen(port)

export default server
