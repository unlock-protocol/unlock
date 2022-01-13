import cron from 'node-cron'
import { Hook } from '../models'
import { notifyOfKeys, notifyOfLocks } from './jobs'

// every 5 minute
const CURRENT_CRON_SCHEDULE = '*/5 * * * *'

cron.schedule(CURRENT_CRON_SCHEDULE, async () => {
  const subscribers = await Hook.findAll({
    where: {
      mode: 'subscribe',
    },
  })

  notifyOfKeys(subscribers)
  notifyOfLocks(subscribers)
})
