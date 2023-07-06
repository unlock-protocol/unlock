import { run } from 'graphile-worker'
import config from '../config/config'
import { addRenewalJobs } from './tasks/renewal/addRenewalJobs'
import { cryptoRenewalJob } from './tasks/renewal/cryptoRenewalJob'
import { fiatRenewalJob } from './tasks/renewal/fiatRenewalJob'
import { addKeyJobs } from './tasks/addKeyJobs'
const connectionString = `postgresql://${config.database.username}:${config.database.password}@${config.database.host}/${config.database.database}`

const crontab = `
*/5 * * * * addRenewalJobs
*/5 * * * * addKeyJobs
`

async function main() {
  const runner = await run({
    connectionString,
    crontab,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      addRenewalJobs,
      addKeyJobs,
      fiatRenewalJob,
      cryptoRenewalJob,
    },
  })

  await runner.promise
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
