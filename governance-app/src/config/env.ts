export const governanceEnv = {
  baseRpcUrl: process.env.BASE_RPC_URL || '',
  baseSubgraphUrl: process.env.BASE_SUBGRAPH_URL || '',
  mainnetRpcUrl: process.env.MAINNET_RPC_URL || '',
  // Staging Privy app shared with unlock-app; override via NEXT_PUBLIC_PRIVY_APP_ID for prod
  privyAppId:
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cm2oqudm203nny8z9ho6chvyv',
}
