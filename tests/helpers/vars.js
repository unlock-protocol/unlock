const unlockPort = process.env.UNLOCK_PORT || 3000
const locksmithPort = process.env.LOCKSMITH_PORT || 8080
const paywallPort = process.env.PAYWALL_PORT || 3001
const unlockProviderAppPort = process.env.UNLOCK_PROVIDER_APP_PORT || 9000
const unlockProviderUnlockHost =
  process.env.UNLOCK_PROVIDER_APP_HOST || '127.0.0.1'
const ci = process.env.CI

const unlockHost = process.env.UNLOCK_HOST || '127.0.0.1'
const locksmithHost = process.env.LOCKSMITH_HOST || '127.0.0.1'
const paywallHost = process.env.PAYWALL_HOST || '127.0.0.1'

const erc20ContractAddress =
  process.env.ERC20_CONTRACT_ADDRESS ||
  '0x591AD9066603f5499d12fF4bC207e2f577448c46'

const testingAddress =
  process.env.ETHEREUM_ADDRESS || '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
const httpProviderHost = process.env.HTTP_PROVIDER_HOST || '127.0.0.1'
const httpProviderPort = process.env.HTTP_PROVIDER_PORT || 8545

module.exports = {
  unlockPort,
  locksmithPort,
  paywallPort,
  unlockProviderAppPort,
  ci,
  unlockHost,
  locksmithHost,
  paywallHost,
  unlockProviderUnlockHost,
  erc20ContractAddress,
  testingAddress,
  httpProviderHost,
  httpProviderPort,
}
