import { run } from 'graphile-worker'
import config from '../config/config'
import { key } from './tasks/keys'

const connectionString = `postgresql://${config.database.username}:${config.database.password}@${config.database.host}/${config.database.database}`

async function main() {
  const runner = await run({
    connectionString,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      key,
    },
    crontab: '*/1 * * * * key',
  })
  await runner.promise
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
