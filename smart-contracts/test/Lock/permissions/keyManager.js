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
  const [keyOwner1] = keyOwners
  const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
  const oneDay = new BigNumber(60 * 60 * 24)
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
      keyOwners.map(() => []),
      {
        value: (keyPrice * keyOwners.length).toFixed(),
        from: accounts[0],
      }
    )
    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
  })

  describe('Key Purchases', () => {
    it('should leave the KM == 0x00(default) for new purchases', async () => {
      const keyManager = await lock.keyManagerOf.call(tokenIds[0])
      assert.equal(keyManager, constants.ZERO_ADDRESS)
    })

    it('should allow to set KM when buying new keys', async () => {
      const tx = await lock.purchase(
        [],
        [keyOwner1],
        [web3.utils.padLeft(0, 40)],
        [accounts[8]],
        [[]],
        {
          value: keyPrice.toFixed(),
          from: keyOwner1,
        }
      )
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const newKeyManager = await lock.keyManagerOf.call(args.tokenId)
      assert.equal(newKeyManager, accounts[8])
    })
  })

  describe('Key Renewal / extend', () => {
    let tokenId
    beforeEach(async () => {
      const tx = await lock.purchase(
        [],
        [keyOwner1],
        [web3.utils.padLeft(0, 40)],
        [web3.utils.padLeft(0, 40)],
        [[]],
        {
          value: keyPrice.toFixed(),
          from: keyOwner1,
        }
      )
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      tokenId = args.tokenId
    })
    it('should reset key manager when specified', async () => {
      assert.equal(
        await lock.keyManagerOf.call(tokenId),
        constants.ZERO_ADDRESS
      )
      assert.equal(await lock.isValidKey.call(tokenId), true)
      await lock.extend(0, tokenId, accounts[8], [], {
        value: keyPrice.toFixed(),
        from: keyOwner1,
      })
      assert.equal(
        await lock.keyManagerOf.call(tokenId),
        constants.ZERO_ADDRESS
      )
    })

    it('should left untouched when not specified', async () => {
      await lock.setKeyManagerOf(tokenId, accounts[9], { from: keyOwner1 })
      assert.equal(await lock.keyManagerOf.call(tokenId), accounts[9])
      await lock.extend(0, tokenId, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: keyOwner1,
      })
      assert.equal(await lock.keyManagerOf.call(tokenId), accounts[9])
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
        keyOwners.map(() => []),
        {
          value: (keyPrice * keyOwners.length).toFixed(),
          from: accounts[0],
        }
      )
      tokenIds = tx.logs
        .filter((v) => v.event === 'Transfer')
        .map(({ args }) => args.tokenId)
      tokenId = tokenIds[0]
    })

    it('should leave the KM == 0x00(default) for new recipients', async () => {
      const tx = await lock.transferFrom(keyOwner1, accounts[8], tokenId, {
        from: keyOwner1,
      })
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      keyManager = await lock.keyManagerOf.call(args.tokenId)
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
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      assert.equal(await lock.keyManagerOf.call(args.tokenId), accounts[8])
    })
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
