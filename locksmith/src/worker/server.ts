import './instrument'
import { logger } from '../logger'
import { startWorker } from './worker'

logger.info('Worker server started.')

startWorker()
  .then(async () => {
    logger.info('Worker server done!')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
