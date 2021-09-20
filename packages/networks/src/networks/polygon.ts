import { NetworkConfig } from '../types';

export const polygon: NetworkConfig = {
    providerUrl:
        'https://snowy-weathered-waterfall.matic.quiknode.pro/5b11a0413a62a295070c0dfb25637d5f8c591aba/',
    unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
    id: 137,
    name: 'Polygon',
    blockTime: 1000,
    subgraphURI:
        'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon',
    explorer: {
        name: 'Polygonscan',
        urls: {
            address: (address) => `https://polygonscan.com/address/${address}`,
            transaction: (hash) => `https://polygonscan.com/tx/${hash}`,
        },
    },
    requiredConfirmations: 12,
    erc20: null,
    baseCurrencySymbol: 'Matic',
    // locksmith: services.storage.host,
    nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18,
    },
}

export default polygon