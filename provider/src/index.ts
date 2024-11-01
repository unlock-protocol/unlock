import handler from './handler'
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
    return await handler(request, env)
  },
} as ExportedHandler<Env>
