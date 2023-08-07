import { JobHelpers, Task } from 'graphile-worker'

const rejectAfter = (duration: number, message = 'Timeout') =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message))
    }, duration)
  })

export const timeout = (
  duration: number,
  callback: Task,
  message = 'Timeout'
) => {
  return async (payload: unknown, helpers: JobHelpers) => {
    await Promise.race([
      rejectAfter(duration, message),
      callback(payload, helpers),
    ])
    return
  }
}
