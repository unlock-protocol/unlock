import { NetworkConfig } from '../types';

export const polygon: NetworkConfig = {
    publicProvider: 'https://rpc-mainnet.maticvigil.com/',
    provider:
        'https://snowy-weathered-waterfall.matic.quiknode.pro/5b11a0413a62a295070c0dfb25637d5f8c591aba/',
    unlockAddress: '0x75f778379623155201B4dd7647907d3ABbDB6753',
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
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18,
    },
    startBlock: 21844200,
    previousDeploys: [{
        unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
        startBlock: 15714206
    }]
}

export default polygon