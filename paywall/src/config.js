import { getWeb3Provider } from '@unlock-protocol/unlock-js'

import getConfig from 'next/config'

const nextConfig = getConfig() && getConfig().publicRuntimeConfig

/**
 * This function, based on the environment will return the list of providers available, the one that
 * is used, as well as the list of networks and the one that is being used.
 * In dev/testing, the provider can be anything and the network can be anything too.
 * In staging, the provider needs to be an ingested web3 provider, and the network needs to be rinkeby
 * In prod, the provider needs to be an ingested web3 provider and the network needs to be mainnet
 * @param {*} environment (in the JS sense: `window` most likely)
 */
export default function configure(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  environment = global,
  runtimeConfig = nextConfig
) {
  const isServer = typeof window === 'undefined'

  const env = runtimeConfig.unlockEnv
  const locksmithUri = runtimeConfig.locksmithUri || 'http://0.0.0.0:8080'
  const httpProvider = runtimeConfig.httpProvider || '127.0.0.1'
  // Unlock address by default
  // Smart contract deployments yield the same address on a "clean" node as long as long as the migration script runs in the same order.
  const readOnlyProviderUrl =
    runtimeConfig.readOnlyProvider || `http://${httpProvider}:8545`

  let readOnlyProvider
  if (readOnlyProviderUrl) {
    readOnlyProvider = getWeb3Provider(readOnlyProviderUrl)
  }

  return {
    isServer,
    env,
    locksmithUri,
    readOnlyProvider,
  }
}
