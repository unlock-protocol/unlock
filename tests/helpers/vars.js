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

const testingAddress =
  process.env.ETHEREUM_ADDRESS || '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
const httpProviderHost = process.env.HTTP_PROVIDER_HOST || '127.0.0.1'
const httpProviderPort = process.env.HTTP_PROVIDER_PORT || 8545

// All of the addresses below are hard coded but may change if the docker setup changes.
// To check them use the docker logs

const erc20ContractAddress =
  process.env.ERC20_CONTRACT_ADDRESS ||
  '0x89aB03954911bdf3Cd93D22987f96C3527eE4b25'

const paywallETHLockAddress = '0x7388C452674A37f8Be6Ec9BA88eeDc87Ecf9EE46'
const paywallERC20LockAddress = '0xff57584f221Da11DefAfe494BdE01f09b3eA68b5'

const adblockETHLockAddresses = [
  '0x7E6B78c64C369840DC0404e6baB3e5b00e41DB84',
  '0x0dD40Ed60d7fAB6F612EeF4e00395B0C3298201e',
  '0x7ef8faB186E8fb24B996c08dE9A2681d18E5F150',
]
const adblockERC20LockAddresses = [
  '0xa6e7cfD01eE51612f6C547a49d6228F916Be152c',
  '0x085E176321a8622838c184E933AFaFDccfd02F38',
  '0xc765b5631EF06d40dF4C55769741406171F43d37',
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
