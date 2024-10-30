const { expect } = require('chai')
const { ethers } = require('hardhat')
const { reverts, deployLock } = require('../../helpers')

let lock, hook
describe('TokenUriHook', function () {
  this.beforeAll(async function () {
    lock = await deployLock({
      name: 'FREE',
    })

    const TokenUriHook = await ethers.getContractFactory('TokenUriHook')
    hook = await TokenUriHook.deploy()

    await (
      await lock.setEventHooks(
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        await hook.getAddress(),
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress
      )
    ).wait()
  })

  describe('setBaseURI', () => {
    it('should not let a random user set it', async () => {
      const [, another] = await ethers.getSigners()
      await reverts(
        hook
          .connect(another)
          .setBaseURI(await lock.getAddress(), 'http://example.com'),
        'Only lock manager can set base URI'
      )
      expect(await hook.baseURIs(await lock.getAddress())).to.equal('')
    })
    it('should let a lock manager set it', async () => {
      const [manager] = await ethers.getSigners()
      await hook
        .connect(manager)
        .setBaseURI(await lock.getAddress(), 'http://example.com')

      expect(await hook.baseURIs(await lock.getAddress())).to.equal(
        'http://example.com'
      )
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
        [await user.getAddress()],
        [await user.getAddress()],
        [await user.getAddress()],
        ['0x']
      )
      const expiration = await lock.keyExpirationTimestampFor(1)

      expect((await lock.tokenURI(1)).toLowerCase()).to.equal(
        `http://example.com/${await user.getAddress()}?tokenId=1&expiration=${expiration}`.toLowerCase()
      )
    })
  })
})
