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

const paywallETHLockAddress = '0x45DeBF700aB8120aC0665119467EA82BDB45E00b'
const paywallERC20LockAddress = '0x80bc6d2870bB72CB3E37B648C160dA20733386F7'

const adblockETHLockAddresses = [
  '0xC11eF3E2cCE6963653C2c9F66b52e5bD2d274564',
  '0xd9B3865D630941C54B6aA263a4DD4B8e66AB3c5c',
  '0x1c7ec43575239A482a01Ac8A2A73d0c68887e151',
]
const adblockERC20LockAddresses = [
  '0x1c0E27f7967899578eF138384F8cFC0bf579d063',
  '0xce341cc78D9774808f0E5b654aF8B57B5126C6BA',
  '0x0AAF2059Cb2cE8Eeb1a0C60f4e0f2789214350a5',
]

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
  paywallETHLockAddress,
  paywallERC20LockAddress,
  adblockETHLockAddresses,
  adblockERC20LockAddresses,
}
