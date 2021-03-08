const ci = process.env.CI

const unlockPort = process.env.UNLOCK_PORT || 3000
const locksmithPort = process.env.LOCKSMITH_PORT || 8080
const paywallPort = process.env.PAYWALL_PORT || 3001
const theGraphPort = process.env.SUBGRAPH_PORT || 8020

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
  '0xFcD4FD1B4F3d5ceDdc19004579A5d7039295DBB9'

const paywallETHLockAddress = '0x7046B2284F75B4360a56Fb61D716594a92e00528'
const paywallERC20LockAddress = '0x6D9e231E65ABf68d8eA91f3D13C134BB007E4854'

const adblockETHLockAddresses = [
  '0x9cb69bb74e21eBF2C743e8fAA14aC81eD449A75C',
  '0x0CdD24AE99d76e85DC8Cade27fF25eaB2942D93c',
  '0xe5521819981AFA5f6374d867221EbfE2E3c7D2a7',
]
const adblockERC20LockAddresses = [
  '0xE0B7b918b9c9B57a21B59fA520c1320121E3029D',
  '0xbbDa6540Fa3e2d10Fd538d5457A0D8DBd31f6698',
  '0xa0D5a65A0A7E44bEd9d347cAbba79C8cDc583da2',
]

module.exports = {
  unlockPort,
  locksmithPort,
  paywallPort,
  theGraphPort,
  ci,
  unlockHost,
  locksmithHost,
  paywallHost,
  theGraphHost,
  erc20ContractAddress,
  testingAddress,
  httpProviderHost,
  httpProviderPort,
  paywallETHLockAddress,
  paywallERC20LockAddress,
  adblockETHLockAddresses,
  adblockERC20LockAddresses,
}
