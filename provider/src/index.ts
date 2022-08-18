import networks from '@unlock-protocol/networks'

export interface Env {}

/**
 * A proxy worker for JSON RPC endpoints
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    const match = pathname.match(/\/([0-9]*)/)
    if (!match[1]) {
      return new Response('Bad Request', { status: 400 })
    }
    const networkId = parseInt(match[1])
    if (!networks[networkId]) {
      return new Response('Network not supported', { status: 404 })
    }
    // TODO: parse the request BODY, identify the `to` and limit requests only to Unlock contracts
    return fetch(networks[networkId].provider, request)
  },
}
