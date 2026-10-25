// ABOUTME: Keeps a long-running task alive by retrying it with capped exponential
// backoff, so a transient failure such as a dropped database connection never kills the process.

export interface RetryOptions {
  baseDelayMs?: number
  maxDelayMs?: number
  onError?: (error: unknown, attempt: number, delayMs: number) => void
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export const retryForever = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { baseDelayMs = 5_000, maxDelayMs = 60_000, onError } = options
  let attempt = 0
  for (;;) {
    try {
      return await fn()
    } catch (error) {
      attempt += 1
      const delayMs = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
      onError?.(error, attempt, delayMs)
      await sleep(delayMs)
    }
  }
}
