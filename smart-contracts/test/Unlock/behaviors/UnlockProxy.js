const Zos = require('@openzeppelin/cli')
const { ZWeb3, Contracts } = require('@openzeppelin/upgrades')
const { constants } = require('hardlydifficult-ethereum-contracts')

const TestHelper = Zos.TestHelper
const shared = require('./shared')

ZWeb3.initialize(web3.currentProvider)
const Unlock = Contracts.getFromLocal('Unlock')
const PublicLock = artifacts.require('PublicLock')

contract('Unlock / UnlockProxy', (accounts) => {
  const proxyAdmin = accounts[1]

  beforeEach(async () => {
    this.accounts = accounts
    this.unlockOwner = accounts[2]
    // TestHelper retrieves project structure from the zos.json file and deploys everything to the current test network.
    this.project = await TestHelper({ from: proxyAdmin })
    this.proxy = await this.project.createProxy(Unlock, {
      Unlock,
      initMethod: 'initialize',
      initArgs: [this.unlockOwner],
    })
    this.unlock = await Unlock.at(this.proxy.address)
    const lock = await PublicLock.new()
    await this.unlock.methods.setLockTemplate(lock.address).send({
      from: this.unlockOwner,
      gas: constants.MAX_GAS,
    })
  })

  describe('should function as a proxy', () => {
    shared.shouldBehaveLikeV1(this)
  })
})
