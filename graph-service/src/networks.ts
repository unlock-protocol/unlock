import { Env } from './types'

// This function retrieves the subgraph ID associated with a specified network.
// It takes two parameters:
// 1. `network`: A string representing the name of the network (e.g., 'mainnet', 'optimism').
// 2. `env`: An object conforming to the Env interface, containing environment variables for various networks.
export function getSubgraphId(network: string, env: Env): string | undefined {
  // Constructing the key for the environment variable by concatenating 'NETWORK_' with the uppercased network name.
  // This key will be used to access the corresponding subgraph ID from the env object.
  const networkKey = `NETWORK_${network.toUpperCase()}` as keyof Env

  // Returning the subgraph ID from the env object using the constructed network key.
  // If the key does not exist, it will return undefined, indicating that the network is unsupported.
  return env[networkKey]
}
