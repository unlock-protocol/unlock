import { Response } from 'node-fetch'

export interface Env {}

// This is the list of networks currently supported
const supportedNetworks = {
  '1': 'https://eth-mainnet.alchemyapi.io/v2/6idtzGwDtRbzil3s6QbYHr2Q_WBfn100',
  '4': 'https://eth-rinkeby.alchemyapi.io/v2/n0NXRSZ9olpkJUPDLBC00Es75jaqysyT',
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
  '80001': 'https://matic-mumbai.chainstacklabs.com',
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
          'access-control-allow-origin': request.headers.get('Origin'),
          vary: 'Origin',
          'access-control-allow-credentials': 'true',
        },
      })
    }

    // Reject requests that are not POST
    if (request.method !== 'POST') {
      return new Response('Method not supported', { status: 400 })
    }

    const url = new URL(request.url)
    const { pathname } = url
    const [_, networkId] = pathname.match(/\/([0-9]*)/)

    // Missing network
    if (!networkId) {
      return new Response('Bad Request', { status: 400 })
    }

    // Network not supported
    if (!supportedNetworks[networkId]) {
      return new Response('Network not supported', { status: 404 })
    }

    // Make JSON RPC request
    const response = await fetch(supportedNetworks[networkId], {
      method: 'POST',
      body: request.body,
      headers: new Headers({
        Accept: '*/*',
        Origin: 'rpc.unlock-protocol.com', // required to add this to allowlists
      }),
    })
    const json = await response.json()

    return new Response(JSON.stringify(json), {
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': request.headers.get('Origin'),
      },
    })
  },
}
