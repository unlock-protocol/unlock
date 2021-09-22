import { NetworkConfig } from '../types';

export const rinkeby: NetworkConfig = {
    provider:
        'https://eth-rinkeby.alchemyapi.io/v2/n0NXRSZ9olpkJUPDLBC00Es75jaqysyT',
    unlockAddress: '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b',
    id: 4,
    name: 'Rinkeby',
    blockTime: 8000,
    subgraphURI:
        'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock-rinkeby',
    explorer: {
        name: 'Etherscan',
        urls: {
            address: (address) => `https://rinkeby.etherscan.io/address/${address}`,
            transaction: (hash) => `https://rinkeby.etherscan.io/tx/${hash}`,
        },
    },
    requiredConfirmations: 12,
    erc20: {
        symbol: 'WEE',
        address: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
    },
    baseCurrencySymbol: 'Eth',
    locksmithUri: 'https://rinkeby.locksmith.unlock-protocol.com',
    nativeCurrency: {
        name: 'Rinkeby Eth',
        symbol: 'Eth',
        decimals: 18,
    },
}

export default rinkeby