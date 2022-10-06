export interface Env {}

// This is the list of networks currently supported
const supportedNetworks: Record<string, string> = {
  '1': 'https://eth-mainnet.alchemyapi.io/v2/6idtzGwDtRbzil3s6QbYHr2Q_WBfn100',
  '5': 'https://eth-goerli.g.alchemy.com/v2/W3whZVqRNvcuBkI0_ual5xcoYi2jBRGH',
  '10': 'https://opt-mainnet.g.alchemy.com/v2/m-rf3hR-NDY7a8GQ2IryRITCFrB3bhNq',
  '56': 'https://sparkling-soft-owl.bsc.quiknode.pro/a03a1e9b9672664fa7a21fd6c48c359c6a6f16db/',
  '100':
    'https://cool-empty-bird.xdai.quiknode.pro/4edba942fb43c718f24480484684e907fe3fe1d3/',
  '137':
    'https://snowy-weathered-waterfall.matic.quiknode.pro/5b11a0413a62a295070c0dfb25637d5f8c591aba/',
  '42161':
    'https://arb-mainnet.g.alchemy.com/v2/vwvJn-FammE6EtHhy30U40z3OwPYBjCM',
  '42220':
    'https://quiet-maximum-lambo.celo-mainnet.quiknode.pro/31d4d6ed57349dd99a708d80ac17d5aff6583e4e/',
  '43114':
    'https://cool-soft-seed.avalanche-mainnet.quiknode.pro/e5f7a0185de88b77fe80a61dbd0b210fba01c634/',
  '80001':
    'https://polygon-mumbai.g.alchemy.com/v2/17UXDgmBaQN_gbMd9l25cOMqAGZHR-1B',
}

/**
 * A proxy worker for JSON RPC endpoints
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
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
      return new Response(JSON.stringify({ message: 'Method not supported' }), {
        status: 400,
        headers: {
          'content-type': 'application/json',
        },
      })
    }

    const matched = pathname.match(/\/([0-9]*)/)

    // Missing network
    if (!matched) {
      return new Response(JSON.stringify({ message: 'Bad Request' }), {
        headers: {
          'content-type': 'application/json',
        },
        status: 400,
      })
    }

    const [_, networkId] = matched

    const supportedNetwork = supportedNetworks[networkId]

    // Network not supported
    if (!supportedNetwork) {
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
  },
}
