import { NetworkConfig } from '@unlock-protocol/types'

export const base: NetworkConfig = {
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://developer-access-mainnet.base.org',
  provider: 'https://rpc.unlock-protocol.com/8453',
  unlockAddress: '0xd0b14797b9D08493392865647384974470202A78',
  multisig: '0x8149FeaFa41DD1ee3CA62299b9c67e9ac12FA340',
  keyManagerAddress: '',
  id: 8453,
  name: 'Base',
  chain: 'base',
  subgraph: {
    networkName: 'base',
    endpoint:
      'https://api.studio.thegraph.com/query/44190/unlock-protocol-base-goerli/0.0.2',
    endpointV2:
      'https://api.studio.thegraph.com/query/44190/unlock-protocol-base-goerli/0.0.2',
  },
  explorer: {
    name: 'Basescan',
    urls: {
      base: `https://basescan.org/`,
      address: (address: string) => `https://basescan.org/address/${address}`,
      transaction: (hash: string) => `https://basescan.org/tx/${hash}`,
      token: (address: string, holder: string) =>
        `https://basescan.org/token/${address}?a=${holder}`,
    },
  },
  description:
    'Base is a secure, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain.  ',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    coingecko: 'ethereum',
  },
  startBlock: 0,
  isTestNetwork: false,
  fullySubsidizedGas: false,
  maxFreeClaimCost: 10,
}

export default base
