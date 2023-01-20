const networks = require('@unlock-protocol/networks')

const mainnet = {
  // currencies
  'USDC' : '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  'SHIBA_INU' : '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  'WETH' : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'DAI' : '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'WBTC' : '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  
  // Unlock stuff
  'UDT' : '0x90DE74265a416e1393A450752175AED98fe11517',
  'UNLOCK_ADDRESS' : networks['mainnet'].unlockAddress,
  'UNLOCK_MULTISIG' : '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9',
  'UNLOCK_GOVERNOR' : '0x7757f7f21F5Fa9b1fd168642B79416051cd0BB94',
  'UNLOCK_TIMELOCK' : '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B',
  'UNLOCK_PROXY_OWNER' : '0xF867712b963F00BF30D372b857Ae7524305A0CE7',

  // uniswap
  'POSITION_MANAGER_ADDRESS' : '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  'UNISWAP_FACTORY_ADDRESS' : '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  'V3_SWAP_ROUTER_ADDRESS' : '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
}

// whales
const whales = {
  [mainnet.DAI]: '0xf977814e90da44bfa03b6295a0616a897441acec',// binance
  [mainnet.USDC]: '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
  [mainnet.WBTC]: '0x845cbCb8230197F733b59cFE1795F282786f212C',
  [mainnet.UDT]: '0xf5c28ce24acf47849988f147d5c75787c0103534', // unlock-protocol.eth
}

const polygon = {
  // currencies
  'USDC' : '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  'WETH' : '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  'DAI' : '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  'WBTC' : '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',

  // Unlock stuff
  'UNLOCK_ADDRESS' : networks['polygon'].unlockAddress,
  'UDT' : '0xf7E78d9C4c74df889A83C8C8d6D05BF70fF75876',
  'UNLOCK_PROXY_OWNER' : '0x479f3830fbd715342868BA95E438609BCe443DFB',
  
  // uniswap
  // 'POSITION_MANAGER_ADDRESS' : '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  'UNISWAP_FACTORY_ADDRESS' : '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  // 'V3_SWAP_ROUTER_ADDRESS' : '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
}

// whales
const polygonWhales = {
  [polygon.USDC]: '0xf977814e90da44bfa03b6295a0616a897441acec',
  [polygon.DAI]: '0x91993f2101cc758d0deb7279d41e880f7defe827',
  [polygon.WBTC]: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
  [polygon.UDT]: '0xf5c28ce24acf47849988f147d5c75787c0103534',
}

let contracts = {
  ...mainnet,
  CHAIN_ID: 1,
  whales,
}

switch (process.env.RUN_FORK) {
  case '1':
    contracts
    break;
  case '137':
    contracts = {
      ...polygon,
      CHAIN_ID: 137,
      whales: polygonWhales,
    }
    break;
  default:
    contracts 
    break;
}

module.exports = contracts