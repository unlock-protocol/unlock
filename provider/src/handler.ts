import supportedNetworks from './supportedNetworks'
import { Env } from './types'

interface RpcRequest {
  id: number
  jsonrpc: string
  method: string
  params: string[]
}

const handler = async (request: Request, env: Env): Promise<Response> => {
  // Handling CORS
  if (request.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'access-control-allow-methods': 'POST, GET, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '86400',
        'access-control-allow-origin': '*',
        vary: 'Origin',
        'access-control-allow-credentials': 'true',
      },
    })
  }

  const url = new URL(request.url)
  const { pathname } = url
  const queryURL = url.searchParams.get('url')
  const headers = {
    'access-control-allow-origin': '*',
  }

  if (pathname === '/throw') {
    throw new Error('Test Error')
  }

  if (pathname === '/resolve-redirect' && queryURL) {
    const endpoint = new URL(queryURL)
    const result = await fetch(endpoint.toString(), {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000), // 5 seconds timeout
    })
    return Response.json(
      { url: result.url },
      {
        status: 200,
        headers,
      }
    )
  }

  if (pathname === '/data' && queryURL) {
    const endpoint = new URL(queryURL)
    // Proxy the request
    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      body: request.body,
      headers: new Headers({
        Accept: '*/*',
        Origin: 'https://unlock-protocol.com/',
        'Content-type': 'application/json',
      }),
    })

    const json: { data?: string } = await response.json()

    if (!json?.data) {
      return Response.json(
        {
          message: 'No data input found in the result.',
        },
        {
          status: 400,
          headers,
        }
      )
    }

    return Response.json(json, {
      status: 200,
      headers,
    })
  }

  const matched = pathname.match(/\/([0-9]*)/)
  // Missing network
  if (!pathname || pathname === '/' || !matched) {
    return Response.json(
      { message: 'Bad Request, missing chain id' },
      {
        status: 400,
        headers,
      }
    )
  }

  const [_, networkId] = matched

  const supportedNetwork = supportedNetworks(env, networkId)

  // Network not supported
  if (!supportedNetwork) {
    return Response.json(
      { message: `Unsupported network ID: ${networkId}` },
      {
        status: 404,
        headers,
      }
    )
  }

  // Reject requests that are not POST
  if (request.method !== 'POST') {
    return Response.json(
      { message: `Method ${request.method} not supported` },
      {
        status: 400,
        headers,
      }
    )
  }

  const body: RpcRequest = await request.json()
  const bodyAsString = JSON.stringify(body)
  console.log(bodyAsString)
  // Handling chainId locally
  if (
    body?.method?.toLocaleLowerCase().trim() ===
    'eth_chainId'.toLocaleLowerCase()
  ) {
    return Response.json(
      {
        id: body.id || 42,
        jsonrpc: '2.0',
        result: `0x${parseInt(networkId).toString(16)}`,
      },
      {
        headers,
      }
    )
  }

  // Make JSON RPC request
  const response = await fetch(supportedNetwork, {
    method: 'POST',
    body: bodyAsString,
    headers: new Headers({
      Accept: '*/*',
      Origin: 'https://rpc.unlock-protocol.com/', // required to add this to allowlists
    }),
  })

  const json = await response.json()

  return Response.json(json, {
    headers,
  })
}

export default handler
