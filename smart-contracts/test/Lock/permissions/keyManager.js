const { reverts } = require('truffle-assertions')
const BigNumber = require('bignumber.js')
const { constants } = require('hardlydifficult-ethereum-contracts')
const { ethers } = require('hardhat')
const deployLocks = require('../../helpers/deployLocks')
const getProxy = require('../../helpers/proxy')

const unlockContract = artifacts.require('Unlock.sol')

let unlock
let locks
let lock
let lockCreator
let tokenIds

contract('Permissions / KeyManager', (accounts) => {
  lockCreator = accounts[0]
  const lockManager = lockCreator
  const keyGranter = lockCreator
  const keyOwners = [accounts[1], accounts[2], accounts[3]]
  const [keyOwner1, keyOwner2, keyOwner3] = keyOwners
  const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
  const oneDay = new BigNumber(60 * 60 * 24)
  let keyManagerBefore
  let keyManager
  let validExpirationTimestamp

  beforeEach(async () => {
    // get time
    const blockNumber = await ethers.provider.getBlockNumber()
    const latestBlock = await ethers.provider.getBlock(blockNumber)
    validExpirationTimestamp = Math.round(latestBlock.timestamp + 600)

    // purchase keys
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, lockCreator)
    lock = locks.FIRST
    const tx = await lock.purchase(
      [],
      keyOwners,
      keyOwners.map(() => web3.utils.padLeft(0, 40)),
      keyOwners.map(() => web3.utils.padLeft(0, 40)),
      [],
      {
        value: (keyPrice * keyOwners.length).toFixed(),
        from: accounts[0],
      }
    )
    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)

    //   await lock.setKeyManagerOf(tokenId, accounts[9], { from: keyOwner3 })
    //   await lock.expireAndRefundFor(keyOwner3, 0, { from: lockManager })
  })

  describe('Key Purchases', () => {
    it('should leave the KM == 0x00(default) for new purchases', async () => {
      const keyManager = await lock.keyManagerOf.call(tokenIds[0])
      assert.equal(keyManager, constants.ZERO_ADDRESS)
    })

    it('should not change KM when user already has some valid keys', async () => {
      keyManagerBefore = await lock.keyManagerOf.call(tokenIds[0])
      await lock.purchase(
        [],
        [keyOwner1],
        [web3.utils.padLeft(0, 40)],
        [web3.utils.padLeft(0, 40)],
        [],
        {
          value: keyPrice.toFixed(),
          from: keyOwner1,
        }
      )
      keyManager = await lock.keyManagerOf.call(tokenIds[0])
      assert.equal(keyManagerBefore, keyManager)
    })

    it('should reset the KM == 0x00 when renewing expired keys', async () => {
      const tokenId = tokenIds[0]
      await lock.setKeyManagerOf(tokenId, accounts[9], { from: keyOwner1 })
      keyManagerBefore = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManagerBefore, accounts[9])
      await lock.expireAndRefundFor(keyOwner1, 0, { from: lockManager })
      await lock.purchase(
        [],
        [keyOwner1],
        [web3.utils.padLeft(0, 40)],
        [web3.utils.padLeft(0, 40)],
        [],
        {
          value: keyPrice.toFixed(),
          from: keyOwner1,
        }
      )
      assert.notEqual(tokenId, 0)
      keyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManager, constants.ZERO_ADDRESS)
    })
  })

  describe('Key Transfers', () => {
    let tokenId
    before(async () => {
      unlock = await getProxy(unlockContract)
      locks = await deployLocks(unlock, lockCreator)
      lock = locks.FIRST
      const tx = await lock.purchase(
        [],
        keyOwners,
        keyOwners.map(() => web3.utils.padLeft(0, 40)),
        keyOwners.map(() => web3.utils.padLeft(0, 40)),
        [],
        {
          value: (keyPrice * keyOwners.length).toFixed(),
          from: accounts[0],
        }
      )
      tokenIds = tx.logs
        .filter((v) => v.event === 'Transfer')
        .map(({ args }) => args.tokenId)
      tokenId = tokenIds[2]
      await lock.setKeyManagerOf(tokenId, accounts[9], { from: keyOwner3 })
      await lock.expireAndRefundFor(keyOwner3, 0, { from: lockManager })
    })

    it('should leave the KM == 0x00(default) for new recipients', async () => {
      await lock.transferFrom(keyOwner1, accounts[8], tokenId, {
        from: keyOwner1,
      })
      keyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManager, constants.ZERO_ADDRESS)
    })

    it('should not change KM for existing valid key owners', async () => {
      const tokenId2 = tokenIds[1]
      keyManagerBefore = await lock.keyManagerOf.call(tokenId)
      await lock.transferFrom(accounts[8], keyOwner2, tokenId2, {
        from: accounts[8],
      })
      keyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManagerBefore, keyManager)
    })

    it('should reset the KM to 0x00 for expired key owners', async () => {
      keyManagerBefore = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManagerBefore, accounts[9])
      await lock.transferFrom(keyOwner2, keyOwner3, tokenId, {
        from: keyOwner2,
      })
      keyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManager, constants.ZERO_ADDRESS)
    })
  })

  describe('Key Sharing', () => {
    let newTokenId
    beforeEach(async () => {
      // share key creates a new key
      const tx = await lock.shareKey(accounts[4], tokenIds[0], oneDay, {
        from: keyOwners[0],
      })
      const {
        args: { tokenId },
      } = tx.logs.find(
        (v) => v.event === 'Transfer' && v.from !== constants.ZERO_ADDRESS
      )
      newTokenId = tokenId
    })

    it('should leave the KM == 0x00(default) for new recipients', async () => {
      const newKeyManager = await lock.keyManagerOf.call(newTokenId)
      assert.equal(newKeyManager, constants.ZERO_ADDRESS)
    })

    /*
    it('should not change KM for existing valid key owners', async () => {
      keyManagerBefore = await lock.keyManagerOf.call(tokenId)
      await lock.shareKey(keyOwner2, tokenId, oneDay, {
        from: keyOwner1,
      })
      tokenId = await lock.getTokenIdFor(keyOwner2)
      keyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManagerBefore, keyManager)
    })

    it('should reset the KM to 0x00 for expired key owners', async () => {
      tokenId = await lock.getTokenIdFor.call(keyOwner1)
      assert.notEqual(tokenId, 0)
      let keyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManager, constants.ZERO_ADDRESS)
      const owner = await lock.ownerOf.call(tokenId)
      assert.equal(owner, keyOwner1)
      await lock.setKeyManagerOf(tokenId, accounts[9], { from: keyOwner1 })
      keyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManager, accounts[9])
      await lock.expireAndRefundFor(keyOwner1, 0, { from: lockCreator })
      assert.equal(await lock.getHasValidKey.call(keyOwner1), false)
      tokenId = await lock.getTokenIdFor(keyOwner2)
      await lock.shareKey(keyOwner1, tokenId, oneDay, {
        from: keyOwner2,
      })
      tokenId = await lock.getTokenIdFor(keyOwner1)
      keyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(await lock.getHasValidKey.call(keyOwner1), true)
      assert.equal(keyManager, constants.ZERO_ADDRESS)
    })
    */
  })

  describe('Key Granting', () => {
    it('should let KeyGranter set an arbitrary KM for new keys', async () => {
      const tx = await lock.grantKeys(
        [accounts[7]],
        [validExpirationTimestamp],
        [accounts[8]],
        {
          from: keyGranter,
        }
      )
      const {
        args: { tokenId: newTokenId },
      } = tx.logs.find(
        (v) => v.event === 'Transfer' && v.from === constants.ZERO_ADDRESS
      )
      assert.equal(await lock.keyManagerOf.call(newTokenId), accounts[8])
    })

    /*
    it('should let KeyGranter set an arbitrary KM for existing valid keys', async () => {
      const blockNumber = await ethers.provider.getBlockNumber()
      const latestBlock = await ethers.provider.getBlock(blockNumber)
      const newTimestamp = Math.round(latestBlock.timestamp + 60 * 60 * 24 * 30)
      assert.equal(await lock.getHasValidKey.call(accounts[7]), true)
      await lock.grantKeys([accounts[7]], [newTimestamp], [keyGranter], {
        from: keyGranter,
      })
      tokenId = await lock.getTokenIdFor(accounts[7])
      keyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(keyManager, keyGranter)
    })
    
    it('should let KeyGranter set an arbitrary KM for expired keys', async () => {
      await lock.expireAndRefundFor(accounts[7], 0, { from: lockCreator })
      assert.equal(await lock.getHasValidKey.call(accounts[7]), false)
      const blockNumber = await ethers.provider.getBlockNumber()
      const latestBlock = await ethers.provider.getBlock(blockNumber)
      const newTimestamp = Math.round(latestBlock.timestamp + 60 * 60 * 24 * 30)
      await lock.grantKeys(
        [accounts[7]],
        [newTimestamp],
        [constants.ZERO_ADDRESS],
        {
          from: lockCreator,
        }
      )
      const newKeyManager = await lock.keyManagerOf.call(tokenId)
      assert.equal(newKeyManager, constants.ZERO_ADDRESS)
    })
    */
  })

  describe('configuring the key manager', () => {
    it('should allow the current keyManager to set a new KM', async () => {
      assert.equal(
        await lock.keyManagerOf.call(tokenIds[0]),
        constants.ZERO_ADDRESS
      )
      await lock.setKeyManagerOf(tokenIds[0], accounts[9], { from: keyOwner1 })
      assert.equal(await lock.keyManagerOf.call(tokenIds[0]), accounts[9])
    })

    it('should allow a LockManager to set a new KM', async () => {
      await lock.setKeyManagerOf(tokenIds[1], accounts[7], {
        from: lockManager,
      })
      assert.equal(await lock.keyManagerOf.call(tokenIds[1]), accounts[7])
    })

    it('should fail to allow anyone else to set a new KM', async () => {
      await reverts(
        lock.setKeyManagerOf(tokenIds[0], accounts[2], { from: accounts[5] }),
        'UNAUTHORIZED_KEY_MANAGER_UPDATE'
      )
    })
  })
})
