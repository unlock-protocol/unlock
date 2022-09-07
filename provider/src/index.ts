export interface Env {}

// This is the list of networks currently supported
const supportedNetworks = {
  '1': 'https://eth-mainnet.alchemyapi.io/v2/6idtzGwDtRbzil3s6QbYHr2Q_WBfn100',
  '4': 'https://eth-rinkeby.alchemyapi.io/v2/n0NXRSZ9olpkJUPDLBC00Es75jaqysyT',
  '5': 'https://eth-goerli.g.alchemy.com/v2/W3whZVqRNvcuBkI0_ual5xcoYi2jBRGH',
  '10': 'https://mainnet.optimism.io',
  '56': 'https://rpc.ankr.com/bsc',
  '100':
    'https://cool-empty-bird.xdai.quiknode.pro/4edba942fb43c718f24480484684e907fe3fe1d3/',
  '137':
    'https://snowy-weathered-waterfall.matic.quiknode.pro/5b11a0413a62a295070c0dfb25637d5f8c591aba/',
  '42161': 'https://rpc.ankr.com/arbitrum',
  '42220': 'https://forno.celo.org',
  '43114': 'https://api.avax.network/ext/bc/C/rpc',
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
    const url = new URL(request.url)
    const { pathname } = url
    const [_, networkId] = pathname.match(/\/([0-9]*)/)
    if (!networkId) {
      return new Response('Bad Request', { status: 400 })
    }
    if (!supportedNetworks[networkId]) {
      return new Response('Network not supported', { status: 404 })
    }
    return fetch(supportedNetworks[networkId], request)
  },
}
