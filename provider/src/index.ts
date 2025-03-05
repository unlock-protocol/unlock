import handler from './handler'
import { Env } from './types'
import { prefillLockCache } from './cache'

// Flag to track if we've initialized the cache yet
let cacheInitialized = false

/**
 * A proxy worker for JSON RPC endpoints
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext
  ): Promise<Response> {
    // Initialize the lock cache if it hasn't been done yet
    // This improves performance by prefilling the memory cache with known locks
    if (!cacheInitialized && env.LOCK_CACHE) {
      // Don't block the current request on cache initialization
      // In a no-cron environment, this is the only time the cache will be prefilled
      context.waitUntil(
        prefillLockCache(env).then(() => {
          cacheInitialized = true
          console.log(
            'Cache initialization complete (no scheduled refresh enabled)'
          )
        })
      )
    }

    context.passThroughOnException()
    return await handler(request, env)
  },

  // This handler won't be called if cron triggers aren't configured
  // Remains for documentation purposes and in case cron is enabled in the future
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    context: ExecutionContext
  ): Promise<void> {
    console.log(
      'Running scheduled cache refresh (this only runs if cron triggers are configured)'
    )
    context.waitUntil(prefillLockCache(env))
  },
} as ExportedHandler<Env>
