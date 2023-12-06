import { NetworkConfig } from '@unlock-protocol/types'

export const pulsechainTestnetV4: NetworkConfig = {
    chain: 'pulsechainTestnetV4',
    description: 'Pulsechain Testnetv4 is the test ground for Pulsechain which is a full system state fork of Ethereum mainnet and maintains upstream compatliblity with the Ethereum code base. It provides lower gas costs and 10s block times and is supported by a community that places importance on permissionless protocols.',
    explorer: {
        name: 'pulsechainTestnetV4',
        urls: {
            address: (address: string) =>
                `https://scan.v4.testnet.pulsechain.com/address/${address}`,
            base: `https://scan.v4.testnet.pulsechain.com/`,
            token: (address: string, holder: string) =>
                `https://scan.v4.testnet.pulsechain.com/token/${address}?a=${holder}`,
            transaction: (hash: string) => `https://scan.v4.testnet.pulsechain.com/tx/${hash}`,
        },
    },
    featured: false,
    fullySubsidizedGas: false,
    id: 943,
    isTestNetwork: false,
    keyManagerAddress: '',
    maxFreeClaimCost: 10000,
    multisig: '',
    name: 'pulsechainTestnetV4',
    nativeCurrency: {
        decimals: 18,
        name: 'tPLS',
        symbol: 'tPLS',
    },
    previousDeploys: [],
    provider: 'https://rpc.unlock-protocol.com/369',
    publicLockVersionToDeploy: 13,
    publicProvider: 'https://rpc.v4.testnet.pulsechain.com',
    startBlock: 2247300,
    // Graph can be found at https://scan.v4.testnet.pulsechain.com/graphiql/
    subgraph: {
        endpoint:
            '',
        endpointV2:
            '',
        networkName: 'pulsechainTestnetV4',
        studioEndpoint: 'unlock-protocol-pulsechainTestnetV4',
    },
    unlockAddress: '',
    url: '',
}

export default pulsechainTestnetV4
