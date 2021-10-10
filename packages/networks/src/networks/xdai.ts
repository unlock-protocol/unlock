import { NetworkConfig } from '../types';

export const xdai: NetworkConfig = {
    provider: 'https://cool-empty-bird.xdai.quiknode.pro/4edba942fb43c718f24480484684e907fe3fe1d3/',
    unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
    id: 100,
    name: 'xDai',
    blockTime: 5000,
    requiredConfirmations: 12,
    subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/xdai',
    explorer: {
        name: 'Blockscout',
        urls: {
            address: (address) =>
                `https://blockscout.com/poa/xdai/address/${address}/transactions`,
            transaction: (hash) => `https://blockscout.com/poa/xdai/tx/${hash}`,
        },
    },
    erc20: null, // no default ERC20 on xdai for now
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    baseCurrencySymbol: 'xDai',
    nativeCurrency: {
        name: 'xDAI',
        symbol: 'xDai',
        decimals: 18,
    },
}
export default xdai