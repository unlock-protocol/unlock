import { NetworkConfig } from '@unlock-protocol/types'

export const zkevm: NetworkConfig = {
  chain: 'zkevm',
  description:
    'Polygon zkEVM is a Layer 2 network of the Ethereum Virtual Machine (EVM), a zero-knowledge (ZK) rollup scaling solution.',
  explorer: {
    name: 'zkEVM (Polygonscan)',
    urls: {
      address: (address) => `https://zkevm.polygonscan.com/address/${address}`,
      base: `https://zkevm.polygonscan.com/`,
      token: (address, holder) =>
        `https://zkevm.polygonscan.com/token/${address}?a=${holder}`,
      transaction: (hash) => `https://zkevm.polygonscan.com/tx/${hash}`,
    },
  },
  featured: false,
  id: 1101,
  isTestNetwork: false,
  maxFreeClaimCost: 1,
  multisig: '0xD62EF39c54d9100B17c8fA3C2D15e0262338AED0',
  name: 'zkEVM (Polygon)',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
    wrapped: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/1101',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://polygon-zkevm.drpc.org',
  startBlock: 0,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/21867/unlock-protocol-zkevm/version/latest',
    endpointV2:
      'https://api.studio.thegraph.com/query/21867/unlock-protocol-zkevm/version/latest',
    networkName: 'polygon-zkevm',
  },
  tokens: [
    {
      address: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
      decimals: 18,
      featured: true,
      name: 'Wrapped Ether',
      symbol: 'WETH9',
    },
    {
      address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
      decimals: 6,
      featured: true,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    {
      address: '0x744C5860ba161b5316F7E80D9Ec415e2727e5bD5',
      decimals: 18,
      featured: true,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
      decimals: 8,
      featured: true,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
  ],
  unlockAddress: '0x259813B665C8f6074391028ef782e27B65840d89',
  url: 'https://polygon.technology/polygon-zkevm',
}

export default zkevm
