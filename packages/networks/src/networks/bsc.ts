import { NetworkConfig } from '@unlock-protocol/types';

export const bsc: NetworkConfig = {
    publicProvider: 'https://bsc-dataseed.binance.org/',
    provider:
        'https://bsc-dataseed.binance.org/',
    unlockAddress: '0xeC83410DbC48C7797D2f2AFe624881674c65c856',
    id: 56,
    name: 'Binance Smart Chain',
    blockTime: 1000,
    subgraphURI:
    'https://api.thegraph.com/subgraphs/name/unlock-protocol/bsc',
    explorer: {
        name: 'BscScan',
        urls: {
            address: (address) => `https://bscscan.com/address/${address}`,
            transaction: (hash) => `https://bscscan.com/tx/${hash}`,
        },
    },
    requiredConfirmations: 12,
    erc20: null,
    baseCurrencySymbol: 'BNB',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
    },
    startBlock: 13079000, // 12368889,
    previousDeploys: [{
        unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
        startBlock: 12396000
    }]

}

export default bsc