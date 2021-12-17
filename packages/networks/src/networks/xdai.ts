import { NetworkConfig } from '@unlock-protocol/types';

export const xdai: NetworkConfig = {
    publicProvider: 'https://rpc.xdaichain.com/',
    provider: 'https://cool-empty-bird.xdai.quiknode.pro/4edba942fb43c718f24480484684e907fe3fe1d3/',
    unlockAddress: '0x1bc53f4303c711cc693F6Ec3477B83703DcB317f',
    serializerAddress: '0x646E373EAf8a4AEc31Bf62B7Fd6fB59296d6CdA9',
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
    startBlock: 19338700,
    previousDeploys: [{
        unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
        startBlock: 14521200
    }]

}
export default xdai