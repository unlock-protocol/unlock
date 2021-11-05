export interface NetworkConfig {
    id: number
    name: string
    provider: string
    locksmithUri?: string
    unlockAppUrl?: string
    blockTime?: number
    unlockAddress?: string
    subgraphURI?: string
    explorer?: {
        name: string
        urls: {
            address(address: string): string
            transaction(hash: string): string
        }
    }
    erc20?: {
        symbol: string
        address: string
    } | null
    requiredConfirmations?: number
    baseCurrencySymbol?: string
    nativeCurrency?: {
        name: string
        symbol: string
        decimals: number
    },
    startBlock?: number
}

export interface NetworkConfigs {
    [networkId: number]: NetworkConfig
}