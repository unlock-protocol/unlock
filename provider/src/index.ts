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
      await handler(request, env)
    } catch (error) {
      sentry.captureException(error)
      return new Response('Something went wrong! Team has been notified.', {
        status: 500,
      })
    }
  },
} as ExportedHandler<Env>
