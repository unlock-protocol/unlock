import { JobHelpers, Task } from 'graphile-worker'

const rejectAfter = (duration: number) =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout'))
    }, duration)
  })

export const timeout = (duration: number, callback: Task) => {
  return async (payload: unknown, helpers: JobHelpers) => {
    await Promise.race([rejectAfter(duration), callback(payload, helpers)])
    return
  }
}
