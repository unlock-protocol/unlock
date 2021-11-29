interface PreviousDeploy {
    unlockAddress: string,
    startBlock?: number
}

export interface NetworkConfig {
    id: number
    name: string
    provider: string
    publicProvider: string
    locksmithUri?: string // TODO: remove as this should not be network specific
    unlockAppUrl?: string // TODO: remove as this should not be network specific
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
    previousDeploys?: PreviousDeploy[]
}

export interface NetworkConfigs {
    [networkId: number]: NetworkConfig
}