import { NetworkConfig } from '@unlock-protocol/types';

export const polygon: NetworkConfig = {
    publicProvider: 'https://rpc-mainnet.maticvigil.com/',
    provider:
        'https://snowy-weathered-waterfall.matic.quiknode.pro/5b11a0413a62a295070c0dfb25637d5f8c591aba/',
    unlockAddress: '0xE8E5cd156f89F7bdB267EabD5C43Af3d5AF2A78f',
    serializerAddress: '0xb94AB50Ef47EECcf71108d3eE350AA58177169B8',
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
    startBlock: 21986688,
    previousDeploys: [{
        unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
        startBlock: 15714206
    }]
}

export default polygon