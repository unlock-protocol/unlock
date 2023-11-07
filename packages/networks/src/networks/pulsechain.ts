import { NetworkConfig } from '@unlock-protocol/types'

export const pulsechain: NetworkConfig = {
    chain: 'pulsechain',
    description: 'Pulsechain is a full system state fork of Ethereum mainnet and maintains upstream compatliblity with the Ethereum code base. It provides lower gas costs and 10s block times and is supported by a community that places importance on permissionless protocols.',
    explorer: {
        name: 'Pulsechain',
        urls: {
            address: (address: string) =>
                `https://scan.pulsechain.com/address/${address}`,
            base: `https://scan.pulsechain.com/`,
            token: (address: string, holder: string) =>
                `https://scan.pulsechain.com/token/${address}?a=${holder}`,
            transaction: (hash: string) => `https://scan.pulsechain.com/tx/${hash}`,
        },
    },
    featured: false,

    fullySubsidizedGas: false,
    id: 369,
    isTestNetwork: false,
    keyManagerAddress: '',
    maxFreeClaimCost: 0,
    multisig: '',
    name: 'pulsechain',
    nativeCurrency: {
        coingecko: 'pulsechain',
        decimals: 18,
        name: 'PLS',
        symbol: 'PLS',
    },
    previousDeploys: [],
    provider: 'https://rpc.unlock-protocol.com/369',
    publicLockVersionToDeploy: 13,
    publicProvider: 'https://rpc.pulsechain.com',
    startBlock: 2247300,
    // Graph can be found at https://graph.pulsechain.com/
    subgraph: {
        endpoint:
            '',
        endpointV2:
            '',
        networkName: 'pulsechain',
        studioEndpoint: 'unlock-protocol-pulsechain',
    },
    unlockAddress: '',
    url: '',
}

export default pulsechain
