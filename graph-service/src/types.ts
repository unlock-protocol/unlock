/**
 * This interface defines the structure for environment variables
 * required by the graph service. Each property corresponds to a
 * specific subgraph endpoint for various blockchain networks,
 * enabling dynamic access to their respective GraphQL APIs.
 * The string index signature allows for the inclusion of additional
 * environment variables in the future.
 */
export interface Env {
  MAINNET_SUBGRAPH: string
  OPTIMISM_SUBGRAPH: string
  BSC_SUBGRAPH: string
  GNOSIS_SUBGRAPH: string
  POLYGON_SUBGRAPH: string
  ARBITRUM_SUBGRAPH: string
  CELO_SUBGRAPH: string
  AVALANCHE_SUBGRAPH: string
  BASE_SUBGRAPH: string
  SEPOLIA_SUBGRAPH: string
  LINEA_SUBGRAPH: string
  SCROLL_SUBGRAPH: string
  ZKSYNC_SUBGRAPH: string
  ZKEVM_SUBGRAPH: string
  SENTRY_DSN: string
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
