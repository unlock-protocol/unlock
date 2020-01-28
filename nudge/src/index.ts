import { CronJob } from 'cron'
import { Processor } from './processor'

const config = require('../config/config')
const runInterval = '*/5 * * * *'

new CronJob(runInterval, () => {
  new Processor(config.graphQLEndpoint).processKeys()
}).start()
