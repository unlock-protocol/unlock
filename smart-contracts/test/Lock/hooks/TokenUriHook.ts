const { expect } = require('chai')
const { ethers, unlock } = require('hardhat')
const { reverts } = require('../../helpers')

const expirationDuration = 60 * 60 * 24 * 7
const maxNumberOfKeys = 100
const keyPrice = 0

let lock, hook
describe('TokenUriHook', function () {
  this.beforeAll(async function () {
    await unlock.deployProtocol()
    lock = (
      await unlock.createLock({
        expirationDuration,
        maxNumberOfKeys,
        keyPrice,
        name: 'lock',
      })
    ).lock

    const TokenUriHook = await ethers.getContractFactory('TokenUriHook')
    hook = await TokenUriHook.deploy()
    await hook.deployed()

    await (
      await lock.setEventHooks(
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        hook.address,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero
      )
    ).wait()
  })

  describe('setBaseURI', () => {
    it('should not let a random user set it', async () => {
      const [, another] = await ethers.getSigners()
      await reverts(
        hook.connect(another).setBaseURI(lock.address, 'http://example.com'),
        'Only lock manager can set base URI'
      )
      expect(await hook.baseURIs(lock.address)).to.equal('')
    })
    it('should let a lock manager set it', async () => {
      const [manager] = await ethers.getSigners()
      await hook
        .connect(manager)
        .setBaseURI(lock.address, 'http://example.com'),
        'Only lock manager can set base URI'
      expect(await hook.baseURIs(lock.address)).to.equal('http://example.com')
    })
  })

  describe('tokenURI', function () {
    it('should return no URL if there is no owner!', async () => {
      expect(await lock.tokenURI(1)).to.equal('')
    })
    it('should return the right URL if there is an owner!', async () => {
      const [user] = await ethers.getSigners()

      await lock.purchase(
        [0],
        [user.address],
        [user.address],
        [user.address],
        [[]]
      )
      const expiration = await lock.keyExpirationTimestampFor(1)

      expect((await lock.tokenURI(1)).toLowerCase()).to.equal(
        `http://example.com/${user.address}?tokenId=1&expiration=${expiration}`.toLowerCase()
      )
    })
  })
})
