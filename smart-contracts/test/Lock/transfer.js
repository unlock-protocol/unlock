const { ethers } = require('hardhat')
const { reverts } = require('truffle-assertions')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')
const { errorMessages } = require('../helpers/constants')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

let unlock
let lock
let tokenIds
let newTokenId
let originalDuration
let blockTs

contract('Lock / transfer', (accounts) => {
  const [lockOwner, singleKeyOwner, multipleKeyOwner, destination] = accounts

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    const locks = await deployLocks(unlock, lockOwner)
    lock = locks.OWNED
    await lock.setMaxKeysPerAddress(10)
    const tx = await lock.purchase(
      [],
      [singleKeyOwner, multipleKeyOwner, multipleKeyOwner],
      [
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
      ],
      [
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
      ],

      [],
      {
        value: (await lock.keyPrice()) * 3,
        from: singleKeyOwner,
      }
    )

    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
  })

  describe('transfer a percentage of a key', () => {
    beforeEach(async () => {
      const originalExpiration = await lock.keyExpirationTimestampFor(
        tokenIds[0]
      )
      const tx = await lock.transfer(tokenIds[0], destination, 2500, {
        from: singleKeyOwner,
      })

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      newTokenId = args.tokenId
      const { timestamp } = await ethers.provider.getBlock(tx.blockNumber)
      blockTs = timestamp
      originalDuration = originalExpiration - timestamp
    })

    it('original owner still owns the key', async () => {
      assert.equal(await lock.ownerOf(tokenIds[0]), singleKeyOwner)
    })

    it('new owner has a new key', async () => {
      assert.equal(await lock.getHasValidKey(destination), true)
      assert.equal(await lock.ownerOf(newTokenId), destination)
    })

    it('new key has the correct amount of time transferred', async () => {
      const actual = await lock.keyExpirationTimestampFor(newTokenId)
      assert.equal(
        actual.toNumber() - blockTs,
        Math.floor(originalDuration / 4)
      )
    })
  })

  describe('transfer of the entire key', () => {
    beforeEach(async () => {
      const originalExpiration = await lock.keyExpirationTimestampFor(
        tokenIds[0]
      )
      const tx = await lock.transfer(tokenIds[0], destination, 10000, {
        from: singleKeyOwner,
      })

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      newTokenId = args.tokenId
      const { timestamp } = await ethers.provider.getBlock(tx.blockNumber)
      blockTs = timestamp
      originalDuration = originalExpiration - timestamp
    })

    it('original owner still owns the key', async () => {
      assert.equal(await lock.ownerOf(tokenIds[0]), singleKeyOwner)
    })

    it('original key is not valid anymore', async () => {
      assert.equal(await lock.isValidKey(tokenIds[0]), false)
    })

    it('new owner has a new key', async () => {
      assert.equal(await lock.getHasValidKey(destination), true)
      assert.equal(await lock.ownerOf(newTokenId), destination)
    })

    it('new key has the correct amount of time transferred', async () => {
      const actual = await lock.keyExpirationTimestampFor(newTokenId)
      assert.equal(actual.toNumber() - blockTs, originalDuration)
    })
  })

  it('reverts when attempting to transfer to self', async () => {
    await reverts(
      lock.transfer(tokenIds[0], singleKeyOwner, 1000, {
        from: singleKeyOwner,
      }),
      `${VM_ERROR_REVERT_WITH_REASON} 'TRANSFER_TO_SELF'`
    )
  })

  it('fails if key is expired', async () => {
    // Push the clock forward 1 second so that the test failure reason is consistent
    await lock.expireAndRefundFor(tokenIds[0], 0, {
      from: accounts[0],
    })

    await reverts(
      lock.transfer(tokenIds[0], accounts[9], 1000, { from: singleKeyOwner }),
      'KEY_NOT_VALID'
    )
  })
})
