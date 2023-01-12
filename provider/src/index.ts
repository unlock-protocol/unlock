import handler from './handler'
import { Toucan } from 'toucan-js'
import { Env } from './types'

/**
 * A proxy worker for JSON RPC endpoints
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext
  ): Promise<Response> {
    context.passThroughOnException()

    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      release: '1.0.0',
      context,
      request,
    })

    try {
      return handler(request, env)
    } catch (error) {
      sentry.captureException(error)
      throw error // thow again
    }
  },
}
