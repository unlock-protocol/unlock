import app from './app'
import logger from './logger'

logger.info('Starting Locksmith...')

const port = process.env.PORT || 8080

// in prod, we start immediately
logger.info(`Listening on ${port}`)
const server = app.listen(port)

export default server
