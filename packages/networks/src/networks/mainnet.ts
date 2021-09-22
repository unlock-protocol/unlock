import { NetworkConfig } from '../types';

export const mainnet: NetworkConfig = {
    // httpProvider: null, // we use the injected provider!
    id: 1,
    provider:
        'https://eth-mainnet.alchemyapi.io/v2/6idtzGwDtRbzil3s6QbYHr2Q_WBfn100',
    readOnlyProvider:
        'https://eth-mainnet.alchemyapi.io/v2/b7Mxclz5hGyHqoeodGLQ17F5Qi97S7xJ',
    unlockAddress: '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13',
    name: 'Ethereum',
    blockTime: 8000,
    subgraphURI:
        'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock',
    explorer: {
        name: 'Etherscan',
        urls: {
            address: (address) => `https://etherscan.io/address/${address}`,
            transaction: (hash) => `https://etherscan.io/tx/${hash}`,
        },
    },
    erc20: {
        symbol: 'DAI',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    },
    requiredConfirmations: 12,
    baseCurrencySymbol: 'Eth',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'Eth',
        decimals: 18,
    },
}

export default mainnet