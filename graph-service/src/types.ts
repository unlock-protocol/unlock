/**
 * This interface defines the structure for environment variables
 * needed by the graph worker. Each property corresponds to a
 * specific network or setting, allowing dynamic access to endpoints
 * and identifiers. The string index signature enables flexibility
 * for future environment variables.
 */
export interface Env {
  BASE_URL: string
  NETWORK_MAINNET: string
  NETWORK_OPTIMISM: string
  NETWORK_POLYGON: string
  NETWORK_ARBITRUM: string
  NETWORK_BSC: string
  NETWORK_GNOSIS: string
  NETWORK_GOERLI: string
  NETWORK_SEPOLIA: string
  NETWORK_BASE: string
  NETWORK_CELO: string
  NETWORK_AVALANCHE: string
  [key: string]: string
}

/**
 * This interface defines the structure of a GraphQL
 * request payload. It requires a query string and allows optional
 * variables for flexible query construction
 */
export interface GraphQLRequest {
  query: string
  variables?: Record<string, any>
}
