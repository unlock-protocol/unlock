import { CronJob } from 'cron'
import { Processor } from './processor'

const config = require('../config/config')
const approvedLocks: string[] = []

new CronJob(
  '5 * * * *',
  new Processor(config.graphQLEndpoint, approvedLocks).processKeys
).start()
