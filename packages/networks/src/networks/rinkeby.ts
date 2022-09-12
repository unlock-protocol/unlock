import { NetworkConfig } from '@unlock-protocol/types'

export const rinkeby: NetworkConfig = {
  publicProvider:
    'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  provider: 'https://rpc.unlock-protocol.com/4',
  unlockAddress: '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b',
  serializerAddress: '0x1bd356194d97297F77e081fFFAB97b57297E93e4',
  multisig: '0x04e855D82c079222d6bDBc041F6202d5A0137267',
  id: 4,
  name: 'Rinkeby (Testnet, Support ends 12/21/2022)',
  blockTime: 8000,
  subgraphURI:
    'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock-rinkeby',
  explorer: {
    name: 'Etherscan',
    urls: {
      address: (address) => `https://rinkeby.etherscan.io/address/${address}`,
      transaction: (hash) => `https://rinkeby.etherscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://rinkeby.etherscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (lockAddress, tokenId) =>
      `https://testnets.opensea.io/assets/${lockAddress}/${tokenId}`,
  },
  requiredConfirmations: 12,
  erc20: {
    symbol: 'WEE',
    address: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
  },
  baseCurrencySymbol: 'Eth',
  locksmithUri: 'https://rinkeby.locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'Rinkeby Eth',
    symbol: 'Eth',
    decimals: 18,
  },
  startBlock: 3530008,
  description: 'Ethereum test network. Do not use for production',
  isTestNetwork: true,
  teamMultisig: '0x04e855D82c079222d6bDBc041F6202d5A0137267',
  tokens: [
    {
      name: 'Wrapped Ether',
      address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      name: 'Dai Stablecoin',
      address: '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
      symbol: 'DAI',
      decimals: 18,
    },
    {
      name: 'Maker',
      address: '0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85',
      symbol: 'MKR',
      decimals: 18,
    },
    {
      name: 'Uniswap',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      decimals: 18,
    },
  ],
}

export default rinkeby
