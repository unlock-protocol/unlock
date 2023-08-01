import * as Sentry from '@sentry/node'
import { Task } from 'graphile-worker'

const monitorSlug = 'workers-running'

export const monitor: Task = async () => {
  // 🟡 Notify Sentry your job is running:
  const checkInId = Sentry.captureCheckIn({
    monitorSlug,
    status: 'in_progress',
  })

  // Notify better stack as well.
  await fetch(
    'https://uptime.betterstack.com/api/v1/heartbeat/eLZGiSavyu8jFXhibk4zHfHd'
  )

  // 🟢 Notify Sentry your job has completed successfully:
  Sentry.captureCheckIn({
    checkInId,
    monitorSlug,
    status: 'ok',
  })
}
