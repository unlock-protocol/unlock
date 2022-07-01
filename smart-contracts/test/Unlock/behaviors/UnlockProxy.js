const deployContracts = require('../../fixtures/deploy')
const { MAX_GAS } = require('../../helpers/constants')

const shared = require('./shared')

const PublicLock = artifacts.require('PublicLock')

describe('Unlock / UnlockProxy', (accounts) => {
  const [unlockOwner] = accounts
  this.accounts = accounts

  beforeEach(async () => {
    this.unlockOwner = unlockOwner

    // get proxy from hardhat deployment
    const { unlock } = await deployContracts()
    this.proxyAddress = unlock.address
    this.unlock = unlock

    // deploy template
    const lock = await PublicLock.new()

    await this.unlock.setLockTemplate(lock.address, {
      from: this.unlockOwner,
      gas: MAX_GAS,
    })
  })

  describe('should function as a proxy', () => {
    shared.shouldBehaveLikeV1(this)
  })
})
