const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const { ADDRESS_ZERO } = require('../../helpers/constants')

const KeyManagerMock = artifacts.require('KeyManagerMock')

let keyManagerMock
let keyOwner
let tokenId
const expirationDuration = new BigNumber(60 * 60 * 24 * 30)

contract('Permissions / isKeyManager', (accounts) => {
  keyOwner = accounts[1]
  before(async () => {
    // init template
    keyManagerMock = await KeyManagerMock.new()

    const timestampBefore = new BigNumber(
      await ethers.provider.getBlock('latest').timestamp
    ).plus(expirationDuration)

    const tx = await keyManagerMock.createNewKey(
      keyOwner,
      ADDRESS_ZERO, // beneficiary
      timestampBefore
    )

    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    tokenId = args.tokenId
  })

  describe('confirming the key manager', () => {
    let isKeyManager

    it('should return true if address is the KM', async () => {
      isKeyManager = await keyManagerMock.isKeyManager(tokenId, accounts[1], {
        from: accounts[1],
      })
      assert.equal(isKeyManager, true)
      // it shouldn't matter who is calling
      isKeyManager = await keyManagerMock.isKeyManager(tokenId, accounts[1], {
        from: accounts[5],
      })
      assert.equal(isKeyManager, true)
    })
    it('should return false if address is not the KM', async () => {
      isKeyManager = await keyManagerMock.isKeyManager(tokenId, accounts[9], {
        from: accounts[1],
      })
      assert.equal(isKeyManager, false)
    })
  })
})
