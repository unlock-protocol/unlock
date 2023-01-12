import supportedNetworks from './supportedNetworks'
import { Env } from './types'

const handler = async (request: Request, env: Env): Promise<Response> => {
  // Handling CORS
  if (request.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'access-control-allow-methods': 'POST',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '1800',
        'access-control-allow-origin': '*',
        vary: 'Origin',
        'access-control-allow-credentials': 'true',
      },
    })
  }

  const url = new URL(request.url)
  const { pathname } = url
  const dataURL = url.searchParams.get('url')

  if (pathname === '/data' && dataURL) {
    const endpoint = new URL(dataURL)
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
      return new Response(
        JSON.stringify({
          message: 'No data input found in the result.',
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        }
      )
    }

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
      },
    })
  }

  // Reject requests that are not POST
  if (request.method !== 'POST') {
    console.error(`Method ${request.method} not supported`)
    return new Response(
      JSON.stringify({ message: `Method ${request.method} not supported` }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
        },
      }
    )
  }

  const matched = pathname.match(/\/([0-9]*)/)

  // Missing network
  if (!matched) {
    console.error('Bad Request, missing chain id')
    return new Response(
      JSON.stringify({ message: 'Bad Request, missing chain id' }),
      {
        headers: {
          'content-type': 'application/json',
        },
        status: 400,
      }
    )
  }

  const [_, networkId] = matched

  const supportedNetwork = supportedNetworks(env, networkId)

  // Network not supported
  if (!supportedNetwork) {
    console.error(`Unsupported network ID: ${networkId}`)
    return new Response(
      JSON.stringify({ message: `Unsupported network ID: ${networkId}` }),
      {
        headers: {
          'content-type': 'application/json',
        },
        status: 404,
      }
    )
  }

  // Make JSON RPC request
  const response = await fetch(supportedNetwork, {
    method: 'POST',
    body: request.body,
    headers: new Headers({
      Accept: '*/*',
      Origin: 'https://rpc.unlock-protocol.com/', // required to add this to allowlists
    }),
  })

  const json = await response.json()

  return new Response(JSON.stringify(json), {
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
    },
  })
}

export default handler
