import * as Sentry from '@sentry/node'
import { Task } from 'graphile-worker'
import config from '../../config/config'
import { logger } from '../../logger'

const monitorSlug = 'workers-running'

const ping = async (url: string) => {
  try {
    await fetch(url)
  } catch (error) {
    logger.error('Worker heartbeat ping failed', { error })
  }
}

export const monitor: Task = async () => {
  // 🟡 Notify Sentry your job is running:
  const checkInId = Sentry.captureCheckIn({
    monitorSlug,
    status: 'in_progress',
  })

  // Notify the external heartbeat monitor as well, so a dead worker pages someone.
  if (config.workerHeartbeatUrl) {
    await ping(config.workerHeartbeatUrl)
  }

  // 🟢 Notify Sentry your job has completed successfully:
  Sentry.captureCheckIn({
    checkInId,
    monitorSlug,
    status: 'ok',
  })
}
