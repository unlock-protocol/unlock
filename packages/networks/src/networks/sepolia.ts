import { NetworkConfig } from '@unlock-protocol/types'

export const sepolia: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'sepolia',
  description:
    'Sepolia is the primary testnet recommended by Ethereum for dapp development.',
  explorer: {
    name: 'Sepolia Etherscan',
    urls: {
      address: (address: string) =>
        `https://sepolia.etherscan.io/address/${address}`,
      base: `https://sepolia.etherscan.io/`,
      token: (address: string, holder: string) =>
        `https://sepolia.etherscan.io/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://sepolia.etherscan.io/tx/${hash}`,
    },
  },
  featured: true,
  fullySubsidizedGas: false,
  hooks: {
    onKeyPurchaseHook: [],
  },
  id: 11155111,
  isTestNetwork: true,
  keyManagerAddress: '',
  maxFreeClaimCost: 10,
  multisig: '',
  name: 'Sepolia',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },

  opensea: {
    collectionUrl: (lockAddress) =>
      `https://testnets.opensea.io/assets/base/${lockAddress}`,
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://testnets.opensea.io/assets/base/${_lockAddress}/${_tokenId}`,
  },

  previousDeploys: [],

  provider: 'https://rpc.unlock-protocol.com/11155111',

  publicLockVersionToDeploy: 13,

  publicProvider: 'https://rpc.sepolia.dev',

  startBlock: 4381710,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/21867/unlock-protocol-sepolia',
    endpointV2:
      'https://api.studio.thegraph.com/query/21867/unlock-protocol-sepolia',
    networkName: 'sepolia',
    studioEndpoint: 'unlock-protocol-sepolia',
  },
  tokens: [],
  unlockAddress: '0x36b34e10295cCE69B652eEB5a8046041074515Da',
  url: 'https://github.com/eth-clients/sepolia',
}

export default sepolia
