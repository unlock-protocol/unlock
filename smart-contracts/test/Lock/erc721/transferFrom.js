const BigNumber = require('bignumber.js')

const { constants } = require('hardlydifficult-ethereum-contracts')
const { reverts } = require('truffle-assertions')
const { ethers } = require('hardhat')
const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock
let locks
let tokenIds
let tokenId
let keyOwners

contract('Lock / erc721 / transferFrom', (accounts) => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    await locks.FIRST.updateTransferFee(0) // disable the transfer fee for this test
    await locks['SINGLE KEY'].updateTransferFee(0) // disable the transfer fee for this test
  })

  const from = accounts[1]
  const to = accounts[2]
  const accountWithNoKey = accounts[3]
  const accountWithKey = accounts[4]
  const accountWithKeyApproved = accounts[5]
  const accountNotApproved = accounts[6]
  const accountApproved = accounts[7]
  const accountWithExpiredKey = accounts[8]
  let keyExpiration
  let ID

  before(async () => {
    keyOwners = [
      accountWithKey,
      from,
      accountWithExpiredKey,
      accountWithKeyApproved,
    ]
    const tx = await locks.FIRST.purchase(
      [],
      keyOwners,
      keyOwners.map(() => web3.utils.padLeft(0, 40)),
      keyOwners.map(() => web3.utils.padLeft(0, 40)),
      [],
      {
        value: web3.utils.toWei(`${0.01 * keyOwners.length}`, 'ether'),
        from,
      }
    )

    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)

    tokenId = tokenIds[1]

    keyExpiration = new BigNumber(
      await locks.FIRST.keyExpirationTimestampFor.call(tokenId)
    )
  })

  // / @dev Throws unless `msg.sender` is the current owner, an authorized
  // /  operator, or the approved address for this NFT. Throws if `_from` is
  // /  not the current owner. Throws if `_to` is the zero address. Throws if
  // /  `_tokenId` is not a valid NFT.

  describe('when the lock is public', () => {
    it('should abort when there is no key to transfer', async () => {
      await reverts(
        locks.FIRST.transferFrom(accountWithNoKey, to, 999),
        'KEY_NOT_VALID'
      )
    })

    it('should abort if the recipient is 0x', async () => {
      await reverts(
        locks.FIRST.transferFrom(from, web3.utils.padLeft(0, 40), tokenId, {
          from,
        }),
        'INVALID_ADDRESS'
      )
      // Ensuring that ownership of the key did not change
      const expirationTimestamp = new BigNumber(
        await locks.FIRST.keyExpirationTimestampFor.call(from)
      )
      assert.equal(keyExpiration.toFixed(), expirationTimestamp.toFixed())
    })

    it('should abort if the params are not consistent', async () => {
      // testing an id mismatch
      await reverts(
        locks.FIRST.transferFrom(keyOwners[0], to, tokenIds[4], {
          from: keyOwners[1],
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
      // testing a mismatched _from address
      await reverts(
        locks.FIRST.transferFrom(accountWithKeyApproved, to, tokenIds[0], {
          from: keyOwners[0],
        }),
        'TRANSFER_FROM: NOT_KEY_OWNER'
      )
    })

    describe('when the recipient already has an expired key', () => {
      it('should transfer the key validity without extending it', async () => {
        // First let's make sure from has a key!
        let fromExpirationTimestamp
        const tx = await locks.FIRST.purchase(
          [],
          [from],
          [web3.utils.padLeft(0, 40)],
          [web3.utils.padLeft(0, 40)],
          [],
          {
            value: web3.utils.toWei('0.01', 'ether'),
            from,
          }
        )
        // Get the tokenID
        const { args } = tx.logs.find((v) => v.event === 'Transfer')
        const tokenId = args.tokenId

        // Let's check the expiration date for that key
        fromExpirationTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(tokenId)
        )
        // Then let's expire the key for accountWithExpiredKey
        await locks.FIRST.expireAndRefundFor(tokenId, 0)
        await locks.FIRST.transferFrom(from, accountWithExpiredKey, tokenId, {
          from,
        })
        const expirationTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(tokenId)
        )
        assert.equal(
          expirationTimestamp.toFixed(),
          fromExpirationTimestamp.toFixed()
        )
      })
    })

    describe('when the recipient already has a non expired key', () => {
      let transferredKeyTimestamp
      let transferTs
      let receiverKeyOriginalTimestamp

      before(async () => {
        await locks.FIRST.purchase(
          [],
          [from],
          [web3.utils.padLeft(0, 40)],
          [web3.utils.padLeft(0, 40)],
          [],
          {
            value: web3.utils.toWei('0.01', 'ether'),
            from,
          }
        )

        // Get the tokenID
        const { args } = tx.logs.find((v) => v.event === 'Transfer')
        const tokenId = args.tokenId

        transferredKeyTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(tokenId)
        )

        receiverKeyOriginalTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(accountWithKey)
        )

        const tx = await locks.FIRST.transferFrom(from, accountWithKey, ID, {
          from,
        })

        const transferBlock = await ethers.provider.getBlock(
          tx.receipt.blockNumber
        )
        transferTs = transferBlock.timestamp
      })

      it("should expand the key's validity", async () => {
        const receiverKeyUpdatedTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(accountWithKey)
        )

        assert.equal(
          transferredKeyTimestamp
            .plus(receiverKeyOriginalTimestamp)
            .minus(transferTs)
            .toNumber(),
          receiverKeyUpdatedTimestamp.toNumber()
        )
      })

      it("should invalidate the previous owner's key", async () => {
        const response = await locks.FIRST.getHasValidKey.call(from)
        assert.equal(response, false)
      })
    })

    describe('when the key owner is not the sender', async () => {
      it('should fail if the sender has not been approved for that key', async () => {
        const previousExpirationTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(from)
        )
        await reverts(
          locks.FIRST.transferFrom(from, accountNotApproved, ID, {
            from: accountNotApproved,
          }),
          'KEY_NOT_VALID'
        )
        // Ensuring that ownership of the key did not change
        const expirationTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(from)
        )
        assert.equal(
          previousExpirationTimestamp.toFixed(),
          expirationTimestamp.toFixed()
        )
      })

      it('should succeed if the sender has been approved for that key', async () => {
        ID = await locks.FIRST.getTokenIdFor.call(accountWithKeyApproved)
        await locks.FIRST.approve(accountApproved, ID, {
          from: accountWithKeyApproved,
        })
        await locks.FIRST.transferFrom(
          accountWithKeyApproved,
          accountApproved,
          ID,
          {
            from: accountApproved,
          }
        )
        let balance = await locks.FIRST.balanceOf.call(accountApproved)
        assert.equal(balance, 1)
      })

      it('approval should be cleared after a transfer', async () => {
        assert.equal(await locks.FIRST.getApproved(ID), constants.ZERO_ADDRESS)
      })
    })

    describe('when the key owner is the sender', () => {
      before(async () => {
        // first, let's purchase a brand new key that we can transfer
        await locks.FIRST.purchase(
          [],
          [from],
          [web3.utils.padLeft(0, 40)],
          [web3.utils.padLeft(0, 40)],
          [],
          {
            value: web3.utils.toWei('0.01', 'ether'),
            from,
          }
        )
        ID = tokenId
        keyExpiration = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(from)
        )
        await locks.FIRST.transferFrom(from, to, ID, {
          from,
        })
      })

      it('should mark the previous owner`s key as expired', async () => {
        const expirationTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(from)
        )
        assert(expirationTimestamp.gt(0))
        assert(expirationTimestamp.lt(keyExpiration))
      })

      it('should have assigned the key`s previous expiration to the new owner', async () => {
        const expirationTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(to)
        )
        assert.equal(expirationTimestamp.toFixed(), keyExpiration.toFixed())
      })

      it("should no longer associate the transferred tokenId with the previous owner's address", async () => {
        let transferredKeyTokenId = ID
        let ownerOfToken = await locks.FIRST.ownerOf.call(transferredKeyTokenId)
        assert.notEqual(from, ownerOfToken)
      })
    })

    describe('when the lock is sold out', () => {
      before(async () => {
        // first we create a lock with only 1 key
        await locks['SINGLE KEY'].purchase(
          [],
          [from],
          [web3.utils.padLeft(0, 40)],
          [web3.utils.padLeft(0, 40)],
          [],
          {
            value: web3.utils.toWei('0.01', 'ether'),
            from,
          }
        )
        // confirm that the lock is sold out
        await reverts(
          locks['SINGLE KEY'].purchase(
            [],
            [accounts[8]],
            [web3.utils.padLeft(0, 40)],
            [web3.utils.padLeft(0, 40)],
            [],
            {
              value: web3.utils.toWei('0.01', 'ether'),
              from: accounts[8],
            }
          ),
          'LOCK_SOLD_OUT'
        )
      })

      it('should still allow the transfer of keys', async () => {
        ID = await locks['SINGLE KEY'].getTokenIdFor.call(from)
        let ownerOfBefore = await locks['SINGLE KEY'].ownerOf.call(ID)
        await locks['SINGLE KEY'].transferFrom(ownerOfBefore, accounts[9], ID, {
          from: ownerOfBefore,
        })
        let ownerOfAfter = await locks['SINGLE KEY'].ownerOf.call(ID)
        assert.equal(ownerOfAfter, accounts[9])
      })
    })
  })

  it('can transfer a FREE key', async () => {
    const tx = await locks.FREE.purchase(
      [],
      [accounts[1]],
      [web3.utils.padLeft(0, 40)],
      [web3.utils.padLeft(0, 40)],
      [],
      {
        from: accounts[1],
      }
    )
    const { args } = tx.logs.find(
      (v) => v.event === 'Transfer' && v.args.from === constants.ZERO_ADDRESS
    )
    const { tokenId: newTokenId } = args

    await locks.FREE.transferFrom(accounts[1], accounts[2], newTokenId, {
      from: accounts[1],
    })
    assert.equal(await locks.FREE.ownerOf(newTokenId), accounts[2])
  })
})
