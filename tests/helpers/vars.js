const ci = process.env.CI

const unlockPort = process.env.UNLOCK_PORT || 3000
const locksmithPort = process.env.LOCKSMITH_PORT || 8080
const paywallPort = process.env.PAYWALL_PORT || 3001
const unlockProviderAppPort = process.env.UNLOCK_PROVIDER_APP_PORT || 9000
const theGraphPort = process.env.SUBGRAPH_PORT || 8020

const unlockProviderUnlockHost =
  process.env.UNLOCK_PROVIDER_APP_HOST || '127.0.0.1'
const unlockHost = process.env.UNLOCK_HOST || '127.0.0.1'
const locksmithHost = process.env.LOCKSMITH_HOST || '127.0.0.1'
const paywallHost = process.env.PAYWALL_HOST || '127.0.0.1'
const theGraphHost = process.env.SUBGRAPH_HOST || '127.0.0.1'

const erc20ContractAddress =
  process.env.ERC20_CONTRACT_ADDRESS ||
  '0x591AD9066603f5499d12fF4bC207e2f577448c46'

const testingAddress =
  process.env.ETHEREUM_ADDRESS || '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
const httpProviderHost = process.env.HTTP_PROVIDER_HOST || '127.0.0.1'
const httpProviderPort = process.env.HTTP_PROVIDER_PORT || 8545

const paywallETHLockAddress = '0xE62aFc83d1FD1ec35084Cd14c2841DcEAA27e1bA'
const paywallERC20LockAddress = '0xF31866DdB05d7e12898c4BE337093135d8C737cf'

const adblockETHLockAddresses = [
  '0x50C8d43457cf945c156191424906ee98834c5905',
  '0xcD088b9507844e4b5266487a4b80865FCB48b21A',
  '0x843dBC56E7AA21EBFc0384b7ED5B9104a563fA5d',
]
const adblockERC20LockAddresses = [
  '0xC7CC4a96c5d00074E48e842e72bEcB470a162760',
  '0xC371C5d51348641E25Ff29b8CF5D5b3C1D12eF77',
  '0x157e981bcEB774E629f107dA96B5761683833862',
]

module.exports = {
  unlockPort,
  locksmithPort,
  paywallPort,
  theGraphPort,
  unlockProviderAppPort,
  ci,
  unlockHost,
  locksmithHost,
  paywallHost,
  theGraphHost,
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
