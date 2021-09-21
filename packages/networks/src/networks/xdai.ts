import { NetworkConfig } from '../types';

export const xdai: NetworkConfig = {
    provider: 'https://rpc.xdaichain.com/',
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
    // locksmith: services.storage.host,
    baseCurrencySymbol: 'xDai',
    nativeCurrency: {
        name: 'xDAI',
        symbol: 'xDai',
        decimals: 18,
    },
}
export default xdai