import { allJobs } from './tasks/allJobs'
import { makeWorkerUtils, run, quickAddJob } from 'graphile-worker'
import config from '../config/config'
import {
  addRenewalJobs,
  addRenewalJobsHourly,
  addRenewalJobsWeekly,
  addRenewalJobsDaily,
} from './tasks/renewal/addRenewalJobs'
import { cryptoRenewalJob } from './tasks/renewal/cryptoRenewalJob'
import { fiatRenewalJob } from './tasks/renewal/fiatRenewalJob'
import { addHookJobs } from './tasks/hooks/addHookJobs'
import { sendHook } from './tasks/hooks/sendHook'
import { sendEmailJob } from './tasks/sendEmail'
import { sendToAllJob } from './tasks/sendToAll'
import { monitor } from './tasks/monitor'
import { checkBalances } from './tasks/checkBalances'
import { Pool } from 'pg'
import { notifyExpiredKeysForNetwork } from './jobs/expiredKeys'
import { notifyExpiringKeysForNetwork } from './jobs/expiringKeys'
import { downloadReceipts } from './tasks/receipts'
import { createEventCasterEvent } from './tasks/eventCaster/createEventCasterEvent'
import { rsvpForEventCasterEvent } from './tasks/eventCaster/rsvpForEventCasterEvent'
import exportKeysJob from './tasks/exportKeysJob'

const crontabProduction = `
*/5 * * * * monitor
*/2 * * * * allJobs
*/4 * * * * addRenewalJobs
30 * * * * addRenewalJobsHourly
15 0 * * * addRenewalJobsDaily
45 6 * * 0 addRenewalJobsWeekly
*/5 * * * * addKeyJobs
*/5 * * * * addHookJobs
0 0 * * * notifyExpiringKeysForNetwork
0 0 * * * notifyExpiredKeysForNetwork
30 */6 * * * checkBalances
`

const cronTabTesting = `
*/1 * * * * monitor
*/2 * * * * allJobs
*/4 * * * * addRenewalJobs
30 * * * * addRenewalJobsHourly
15 0 * * * addRenewalJobsDaily
45 6 * * 0 addRenewalJobsWeekly
*/1 * * * * addKeyJobs
*/1 * * * * addHookJobs
0 0 * * * notifyExpiringKeysForNetwork
0 0 * * * notifyExpiredKeysForNetwork
`

const crontab = config.isProduction ? crontabProduction : cronTabTesting

export const addJob = async (jobName: string, payload: any, opts = {}) => {
  // Default priority for tasks is 0, we do not want to make clients wait
  return quickAddJob(
    {
      pgPool: new Pool({
        connectionString: config.databaseUrl,
        // @ts-expect-error - type is not defined properly
        ssl: config.database?.dialectOptions?.ssl,
      }),
    },
    jobName,
    payload,
    opts
  )
}

export async function startWorker() {
  const pgPool = new Pool({
    connectionString: config.databaseUrl,
    // @ts-expect-error - type is not defined properly
    ssl: config.database?.dialectOptions?.ssl,
  })

  // Create worker utils for scheduling tasks
  const workerUtils = await makeWorkerUtils({
    pgPool,
  })

  // Jobs to start when worker starts!
  await workerUtils.addJob('checkBalances', {})

  const runner = await run({
    pgPool,
    crontab,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      exportKeysJob,
      checkBalances,
      monitor,
      allJobs,
      notifyExpiredKeysForNetwork,
      notifyExpiringKeysForNetwork,
      addRenewalJobs,
      addRenewalJobsHourly,
      addRenewalJobsDaily,
      addRenewalJobsWeekly,
      addHookJobs,
      sendEmailJob,
      sendToAllJob,
      sendHook,
      fiatRenewalJob,
      cryptoRenewalJob,
      downloadReceipts,
      createEventCasterEvent,
      rsvpForEventCasterEvent,
    },
  })

  await runner.promise
}
