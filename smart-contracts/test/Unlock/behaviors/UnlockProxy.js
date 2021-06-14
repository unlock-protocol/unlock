const { constants } = require('hardlydifficult-ethereum-contracts')
const { deployments, getUnnamedAccounts, getNamedAccounts } = require('hardhat')

const { get } = deployments
const shared = require('./shared')

const Unlock = artifacts.require('Unlock')
const PublicLock = artifacts.require('PublicLock')

contract('Unlock / UnlockProxy', () => {
  beforeEach(async () => {
    // setup accounts
    const { unlockOwner, proxyAdmin } = await getNamedAccounts()
    this.unlockOwner = unlockOwner
    this.proxyAdmin = proxyAdmin
    this.accounts = await getUnnamedAccounts()

    // get proxy from hardhat deployment
    this.proxy = await get('Unlock')

    // use with truffle
    this.unlock = await Unlock.at(this.proxy.address)
    const lock = await PublicLock.new()
    PublicLock.setAsDeployed(lock)

    await this.unlock.setLockTemplate(lock.address, {
      from: this.unlockOwner,
      gas: constants.MAX_GAS,
    })
  })

  describe('should function as a proxy', () => {
    shared.shouldBehaveLikeV1(this)
  })
})
