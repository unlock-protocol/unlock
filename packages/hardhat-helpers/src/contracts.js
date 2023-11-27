const { networks } = require('@unlock-protocol/networks')

const chainId = parseInt(process.env.RUN_FORK)
const {
  unlockAddress,
  uniswapV3,
  tokens: tokensList,
  multisig,
  nativeCurrency: { wrapped },
} = networks[chainId]

const tokens = tokensList.reduce((prev, { symbol, address }) => {
  prev[symbol] = address
  return prev
}, {})

let chainSpecificValues = {}
let whales = {}

if (chainId === 1) {
  tokens.push({
    symbol: 'SHIBA_INU',
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  })

  chainSpecificValues = {
    UNLOCK_GOVERNOR: '0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591',
    UNLOCK_TIMELOCK: '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B',
    UNLOCK_PROXY_OWNER: '0xF867712b963F00BF30D372b857Ae7524305A0CE7',
    UDT: '0x90DE74265a416e1393A450752175AED98fe11517',

    // uniswap
    POSITION_MANAGER_ADDRESS: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    V3_SWAP_ROUTER_ADDRESS: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  }

  whales = {
    [tokens.DAI]: '0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8', // PulseX
    [tokens.USDC]: '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
    [tokens.WBTC]: '0x845cbCb8230197F733b59cFE1795F282786f212C',
    [tokens.UDT]: '0xf5c28ce24acf47849988f147d5c75787c0103534', // unlock-protocol.eth
  }
}

if (chainId === 137) {
  chainSpecificValues = {
    // Unlock stuff
    UDT: '0xf7E78d9C4c74df889A83C8C8d6D05BF70fF75876',
    UNLOCK_PROXY_OWNER: '0x479f3830fbd715342868BA95E438609BCe443DFB',
  }

  whales = {
    [tokens.USDC]: '0xf977814e90da44bfa03b6295a0616a897441acec',
    [tokens.DAI]: '0x91993f2101cc758d0deb7279d41e880f7defe827',
    [tokens.WBTC]: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    [tokens.UDT]: '0xf5c28ce24acf47849988f147d5c75787c0103534',
  }
}

module.exports = {
  CHAIN_ID: chainId,
  WRAPPED: wrapped,

  // Unlock stuff
  UNLOCK_ADDRESS: unlockAddress,
  UNLOCK_MULTISIG: multisig,

  // uniswap
  UNISWAP_FACTORY_ADDRESS: uniswapV3.factoryAddress,
  whales,

  // custom values
  ...chainSpecificValues,

  // tokens
  ...tokens,
}
