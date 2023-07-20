import { run } from 'graphile-worker'
import config from '../config/config'
import {
  addRenewalJobs,
  addRenewalJobsWeekly,
  addRenewalJobsDaily,
} from './tasks/renewal/addRenewalJobs'
import { cryptoRenewalJob } from './tasks/renewal/cryptoRenewalJob'
import { fiatRenewalJob } from './tasks/renewal/fiatRenewalJob'
import { addKeyJobs } from './tasks/addKeyJobs'
import { addHookJobs } from './tasks/hooks/addHookJobs'
import { sendHook } from './tasks/hooks/sendHook'
import { sendEmail } from './tasks/sendEmail'
import { Pool } from 'pg'

const crontabProduction = `
*/5 * * * * addRenewalJobs
0 0 * * * addRenewalJobsDaily
0 0 * * 0 addRenewalJobsWeekly
*/5 * * * * addKeyJobs
*/5 * * * * addHookJobs
`

const cronTabTesting = `
*/1 * * * * addRenewalJobs
0 0 * * * addRenewalJobsDaily
0 0 * * * addRenewalJobsWeekly
*/1 * * * * addKeyJobs
*/1 * * * * addHookJobs
`

const crontab = config.isProduction ? crontabProduction : cronTabTesting

export async function startWorker() {
  const runner = await run({
    pgPool: new Pool({
      connectionString: config.databaseUrl,
      // @ts-expect-error - type is not defined properly
      ssl: config.database?.dialectOptions?.ssl,
    }),
    crontab,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      addRenewalJobs,
      addRenewalJobsDaily,
      addRenewalJobsWeekly,
      addKeyJobs,
      addHookJobs,
      sendHook,
      sendEmail,
      fiatRenewalJob,
      cryptoRenewalJob,
    },
  })

  await runner.promise
}
