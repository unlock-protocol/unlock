const { constants } = require('hardlydifficult-ethereum-contracts')
const { getProxyAddress } = require('../../helpers/proxy.js')

const shared = require('./shared')

const Unlock = artifacts.require('Unlock')
const PublicLock = artifacts.require('PublicLock')

contract('Unlock / UnlockProxy', (accounts) => {
  const [unlockOwner] = accounts

  beforeEach(async () => {
    this.unlockOwner = unlockOwner

    // get proxy from hardhat deployment
    this.proxy = await getProxyAddress(web3, 'Unlock')

    // use with truffle
    this.unlock = await Unlock.at(this.proxy.address)
    const lock = await PublicLock.new()

    await this.unlock.setLockTemplate(lock.address, {
      from: this.unlockOwner,
      gas: constants.MAX_GAS,
    })
  })

  describe('should function as a proxy', () => {
    shared.shouldBehaveLikeV1(this)
  })
})
