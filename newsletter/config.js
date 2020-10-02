import getConfig from 'next/config'
import { ETHEREUM_NETWORKS_NAMES } from './constants'

const nextConfig = getConfig() && getConfig().publicRuntimeConfig

export default function configure(runtimeConfig = nextConfig) {
  const isServer = typeof window === 'undefined'

  const env = runtimeConfig.unlockEnv

  const locksmithUri = runtimeConfig.locksmithUri || 'http://0.0.0.0:8080'
  const unlockAppUrl = runtimeConfig.unlockAppUrl || 'http://0.0.0.0:3000'
  const unlockStaticUrl = runtimeConfig.unlockStaticUrl || 'http://0.0.0.0:3002'
  const paywallUrl = runtimeConfig.paywallUrl || 'http://0.0.0.0:3001'
  let isRequiredNetwork = () => false
  let requiredNetwork = 'Dev'
  const requiredNetworkId = 1984

  if (env === 'test') {
    isRequiredNetwork = (networkId) => networkId === 1984
  }

  if (env === 'dev') {
    // we start ganache locally with a block time of 3
    isRequiredNetwork = (networkId) => networkId === 1984
  }

  if (env === 'staging') {
    isRequiredNetwork = (networkId) => networkId === 4
  }

  if (env === 'prod') {
    // In prod, the network can only be mainnet
    isRequiredNetwork = (networkId) => networkId === 1
  }

  if (env === 'prod' || env === 'staging') {
    ;[requiredNetwork] = ETHEREUM_NETWORKS_NAMES[requiredNetworkId]
  }

  return {
    isServer,
    env,
    isRequiredNetwork,
    locksmithUri,
    paywallUrl,
    requiredNetworkId,
    requiredNetwork,
    unlockAppUrl,
    unlockStaticUrl,
  }
}
