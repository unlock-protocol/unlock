import { NetworkConfig } from '../types';

export const binance: NetworkConfig = {
    provider:
        'https://bsc-dataseed.binance.org/',
    unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
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
    startBlock: 12368889,
}

export default binance