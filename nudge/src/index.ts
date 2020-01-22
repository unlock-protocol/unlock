import { CronJob } from 'cron'
import { Processor } from './processor'

const config = require('../config/config')
const approvedLocks: string[] = []
const runInterval = '*/5 * * * *'

new CronJob(runInterval, () => {
  console.log(config)

  new Processor(config.graphQLEndpoint, approvedLocks).processKeys()
}).start()
