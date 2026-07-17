import { NetworkConfig } from '@unlock-protocol/types'

export const lens: NetworkConfig = {
  chain: 'lens',
  description:
    'Lens Network is a dedicated Ethereum Layer 2 network built for decentralized social applications, powered by zkSync technology and utilizing Aave’s GHO stablecoin as its native gas token.',
  explorer: {
    name: 'Lens Explorer',
    urls: {
      address: (address) => `https://explorer.lens.xyz/address/${address}`,
      base: 'https://explorer.lens.xyz/',
      token: (address, holder) =>
        `https://explorer.lens.xyz/token/${address}?a=${holder}`,
      transaction: (hash) => `https://explorer.lens.xyz/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {
    onKeyPurchaseHook: [],
  },
  id: 232,
  isTestNetwork: false,
  maxFreeClaimCost: 100,
  multisig: '0xF56892d0b4fE3F4407AaC7A6EdC9f5ddCcFF1CBA',
  name: 'Lens',
  nativeCurrency: {
    coingecko: 'gho',
    decimals: 18,
    name: 'GHO',
    symbol: 'GHO',
    wrapped: '0x6bDc36E20D267Ff0dd6097799f82e78907105e2F',
  },
  provider: 'https://rpc.unlock-protocol.com/232',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://rpc.lens.xyz',
  startBlock: 6079300,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/232',
    graphId: '',
  },
  tokens: [
    {
      address: '0x6bDc36E20D267Ff0dd6097799f82e78907105e2F',
      decimals: 18,
      featured: true,
      name: 'Wrapped GHO',
      symbol: 'WGHO',
    },
    {
      address: '0xE5ecd226b3032910CEaa43ba92EE8232f8237553',
      decimals: 18,
      featured: true,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
  ],
  unlockAddress: '0xbD32e0ea3b3a5b038E942A15De61508b4A61Bd23',
  url: 'https://lens.xyz',
}

export default lens
