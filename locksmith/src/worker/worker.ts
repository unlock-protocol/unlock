import { allJobs } from './tasks/allJobs'
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
import { sendEmailJob } from './tasks/sendEmail'
import { monitor } from './tasks/monitor'
import { Pool } from 'pg'
import { notifyExpiredKeysForNetwork } from './jobs/expiredKeys'
import { notifyExpiringKeysForNetwork } from './jobs/expiringKeys'

const crontabProduction = `
*/5 * * * * monitor
*/5 * * * * allJobs
*/5 * * * * addRenewalJobs
0 0 * * * addRenewalJobsDaily
0 0 * * 0 addRenewalJobsWeekly
*/5 * * * * addKeyJobs
*/5 * * * * addHookJobs
0 0 * * * notifyExpiringKeysForNetwork
0 0 * * * notifyExpiredKeysForNetwork
`

const cronTabTesting = `
*/1 * * * * monitor
*/5 * * * * allJobs
*/1 * * * * addRenewalJobs
0 0 * * * addRenewalJobsDaily
0 0 * * * addRenewalJobsWeekly
*/1 * * * * addKeyJobs
*/1 * * * * addHookJobs
0 0 * * * notifyExpiringKeysForNetwork
0 0 * * * notifyExpiredKeysForNetwork
`

const crontab = config.isProduction ? crontabProduction : cronTabTesting

export async function startWorker() {
  const runner = await run({
    pgPool: new Pool({
      connectionString: config.databaseUrl,
      // @ts-expect-error - type is not defined properly
      ssl: config.database?.dialectOptions?.ssl,
    }),
    // logger: plug into our main logger
    crontab,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      monitor,
      allJobs,
      notifyExpiredKeysForNetwork,
      notifyExpiringKeysForNetwork,
      addRenewalJobs,
      addRenewalJobsDaily,
      addRenewalJobsWeekly,
      addKeyJobs,
      addHookJobs,
      sendEmailJob,
      sendHook,
      sendEmail: sendEmailJob,
      fiatRenewalJob,
      cryptoRenewalJob,
    },
  })

  await runner.promise
}
