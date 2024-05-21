// tests adapted/imported from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/7e41bf2259950c33e55604015875b7780b6a2e63/test/token/ERC20/extensions/ERC20VotesComp.test.js
const { ethers, upgrades } = require('hardhat')
const { assert } = require('chai')
const { advanceBlock, reverts } = require('../helpers')

const {
  ADDRESS_ZERO,
  expectEvent,
  notExpectEvent,
  compareBigNumbers,
  compareBigNumberArrays,
  getLatestBlock,
} = require('../helpers')

const supply = BigInt('100000000')

describe('UnlockProtocolToken / Votes', () => {
  let up
  let transferToken
  let holderSigner, recipientSigner
  let owner, minter, holder, recipient, holderDelegatee, other1, other2

  beforeEach(async () => {
    ;[
      { address: owner },
      minter,
      holderSigner,
      recipientSigner,
      { address: holderDelegatee },
      { address: other1 },
      { address: other2 },
    ] = await ethers.getSigners()
    ;({ address: holder } = holderSigner)
    ;({ address: recipient } = recipientSigner)

    const UnlockDiscountTokenV3 = await ethers.getContractFactory(
      'UnlockProtocolToken'
    )
    up = await upgrades.deployProxy(UnlockDiscountTokenV3, [
      owner,
      await minter.getAddress(),
    ])

    // helper
    transferToken = async (receiver, amount) => {
      return await up.connect(minter).transfer(receiver, amount)
    }
  })

  describe('Supply', () => {
    describe('balanceOf', () => {
      it('grants initial supply to minter account', async () => {
        await transferToken(holder, supply)
        assert(supply == (await up.balanceOf(holder)))
      })
    })
    // it('minting restriction', async () => {
    //   const amount = BigInt('2') ** BigInt('96')
    //   await reverts(
    //     up.mint(minter, amount),
    //     'ERC20Votes: total supply risks overflowing votes'
    //   )
    // })
  })

  describe('Delegation', () => {
    it('delegation with balance', async () => {
      await transferToken(holder, supply)
      assert.equal(await up.delegates(minter), ADDRESS_ZERO)
      const tx = await up.connect(holderSigner).delegate(holder)
      const receipt = await tx.wait()
      const { blockNumber } = receipt

      // console.log(events)
      expectEvent(receipt, 'DelegateChanged', {
        delegator: holder,
        fromDelegate: ADDRESS_ZERO,
        toDelegate: holder,
      })
      expectEvent(receipt, 'DelegateVotesChanged', {
        delegate: holder,
        previousBalance: '0',
        newBalance: supply,
      })

      compareBigNumbers(supply, await up.getVotes(holder))
      compareBigNumbers('0', await up.getPastVotes(holder, blockNumber - 1))
      await advanceBlock()
      compareBigNumbers(supply, await up.getPastVotes(holder, blockNumber))
    })
    it('delegation without balance', async () => {
      assert.equal(await up.delegates(holder), ADDRESS_ZERO)

      const tx = await up.connect(holderSigner).delegate(holder)
      const receipt = await tx.wait()

      expectEvent(receipt, 'DelegateChanged', {
        delegator: holder,
        fromDelegate: ADDRESS_ZERO,
        toDelegate: holder,
      })
      notExpectEvent(receipt, 'DelegateVotesChanged')

      assert.equal(await up.delegates(holder), holder)
    })

    describe('change delegation', () => {
      beforeEach(async () => {
        await transferToken(holder, supply)
        await up.connect(holderSigner).delegate(holder)
      })

      it('call', async () => {
        assert.equal(await up.delegates(holder), holder)

        const tx = await up.connect(holderSigner).delegate(holderDelegatee)
        const receipt = await tx.wait()
        const { blockNumber } = receipt

        expectEvent(receipt, 'DelegateChanged', {
          delegator: holder,
          fromDelegate: holder,
          toDelegate: holderDelegatee,
        })
        expectEvent(receipt, 'DelegateVotesChanged', {
          delegate: holder,
          previousBalance: supply,
          newBalance: '0',
        })
        expectEvent(receipt, 'DelegateVotesChanged', {
          delegate: holderDelegatee,
          previousBalance: '0',
          newBalance: supply,
        })

        assert.equal(await up.delegates(holder), holderDelegatee)
        compareBigNumbers('0', await up.getVotes(holder))
        compareBigNumbers(supply, await up.getVotes(holderDelegatee))

        compareBigNumbers(
          supply,
          await up.getPastVotes(holder, blockNumber - 1)
        )

        compareBigNumbers(
          '0',
          await up.getPastVotes(holderDelegatee, blockNumber - 1)
        )

        await advanceBlock()
        compareBigNumbers('0', await up.getPastVotes(holder, blockNumber))

        compareBigNumbers(
          supply,
          await up.getPastVotes(holderDelegatee, blockNumber)
        )
      })
    })
  })

  describe('Transfers', () => {
    let holderVotes
    let recipientVotes

    beforeEach(async () => {
      await transferToken(holder, supply)
    })
    it('no delegation', async () => {
      const tx = await up.connect(holderSigner).transfer(recipient, 1)
      const receipt = await tx.wait()
      expectEvent(receipt, 'Transfer', {
        from: holder,
        to: recipient,
        value: '1',
      })
      notExpectEvent(receipt, 'DelegateVotesChanged')

      holderVotes = '0'
      recipientVotes = '0'
    })

    it('sender delegation', async () => {
      await up.connect(holderSigner).delegate(holder)

      const tx = await up.connect(holderSigner).transfer(recipient, 1)
      const receipt = await tx.wait()
      expectEvent(receipt, 'Transfer', {
        from: holder,
        to: recipient,
        value: '1',
      })
      expectEvent(receipt, 'DelegateVotesChanged', {
        delegate: holder,
        previousBalance: supply,
        newBalance: supply - 1n,
      })

      holderVotes = supply - 1n
      recipientVotes = '0'
    })

    it('receiver delegation', async () => {
      await up.connect(recipientSigner).delegate(recipient)

      const tx = await up.connect(holderSigner).transfer(recipient, 1)
      const receipt = await tx.wait()
      expectEvent(receipt, 'Transfer', {
        from: holder,
        to: recipient,
        value: '1',
      })
      expectEvent(receipt, 'DelegateVotesChanged', {
        delegate: recipient,
        previousBalance: '0',
        newBalance: '1',
      })

      holderVotes = '0'
      recipientVotes = '1'
    })

    it('full delegation', async () => {
      await up.connect(holderSigner).delegate(holder)
      await up.connect(recipientSigner).delegate(recipient)

      const tx = await up.connect(holderSigner).transfer(recipient, 1)
      const receipt = await tx.wait()
      expectEvent(receipt, 'Transfer', {
        from: holder,
        to: recipient,
        value: '1',
      })
      expectEvent(receipt, 'DelegateVotesChanged', {
        delegate: holder,
        previousBalance: supply,
        newBalance: supply - 1n,
      })
      expectEvent(receipt, 'DelegateVotesChanged', {
        delegate: recipient,
        previousBalance: '0',
        newBalance: '1',
      })

      holderVotes = supply - 1n
      recipientVotes = '1'
    })

    afterEach(async () => {
      compareBigNumbers(holderVotes, await up.getVotes(holder))
      compareBigNumbers(recipientVotes, await up.getVotes(recipient))

      // need to advance 2 blocks to see the effect of a transfer on "getPastVotes"
      const blockNumber = await getLatestBlock()
      await advanceBlock()
      compareBigNumbers(holderVotes, await up.getPastVotes(holder, blockNumber))
      compareBigNumbers(
        recipientVotes,
        await up.getPastVotes(recipient, blockNumber)
      )
    })
  })

  describe('Compound test suite', () => {
    beforeEach(async () => {
      await transferToken(holder, supply)
    })

    describe('balanceOf', () => {
      it('grants to initial account', async () => {
        assert.equal(await up.balanceOf(holder), supply)
      })
    })

    describe('numCheckpoints', () => {
      it('returns the number of checkpoints for a delegate', async () => {
        await up.connect(holderSigner).transfer(recipient, '100') // give an account a few tokens for readability
        compareBigNumbers('0', await up.numCheckpoints(other1))

        const t1 = await up.connect(recipientSigner).delegate(other1)
        compareBigNumbers('1', await up.numCheckpoints(other1))

        const t2 = await up.connect(recipientSigner).transfer(other2, 10)
        compareBigNumbers('2', await up.numCheckpoints(other1))

        const t3 = await up.connect(recipientSigner).transfer(other2, 10)
        compareBigNumbers('3', await up.numCheckpoints(other1))

        const t4 = await up.connect(holderSigner).transfer(recipient, 20)
        compareBigNumbers('4', await up.numCheckpoints(other1))

        compareBigNumberArrays(await up.checkpoints(other1, 0), [
          t1.blockNumber,
          '100',
        ])
        compareBigNumberArrays(await up.checkpoints(other1, 1), [
          t2.blockNumber,
          '90',
        ])
        compareBigNumberArrays(await up.checkpoints(other1, 2), [
          t3.blockNumber,
          '80',
        ])
        compareBigNumberArrays(await up.checkpoints(other1, 3), [
          t4.blockNumber,
          '100',
        ])

        await advanceBlock()
        compareBigNumbers('100', await up.getPastVotes(other1, t1.blockNumber))

        compareBigNumbers('90', await up.getPastVotes(other1, t2.blockNumber))

        compareBigNumbers('80', await up.getPastVotes(other1, t3.blockNumber))

        compareBigNumbers('100', await up.getPastVotes(other1, t4.blockNumber))
      })
    })

    describe('getPastVotes', () => {
      it('reverts if block number >= current block', async () => {
        await reverts(up.getPastVotes(other1, 5e10), 'ERC5805FutureLookup')
      })

      it('returns 0 if there are no checkpoints', async () => {
        compareBigNumbers('0', await up.getPastVotes(other1, 0))
      })

      it('returns the latest block if >= last checkpoint block', async () => {
        const t1 = await up.connect(holderSigner).delegate(other1)
        const { blockNumber } = await t1.wait()
        await advanceBlock()
        await advanceBlock()

        compareBigNumbers(supply, await up.getPastVotes(other1, blockNumber))

        compareBigNumbers(
          supply,
          await up.getPastVotes(other1, blockNumber + 1)
        )
      })

      it('returns zero if < first checkpoint block', async () => {
        await advanceBlock()
        const t1 = await up.connect(holderSigner).delegate(other1)
        const { blockNumber } = await t1.wait()
        await advanceBlock()
        await advanceBlock()

        compareBigNumbers('0', await up.getPastVotes(other1, blockNumber - 1))

        compareBigNumbers(
          supply,
          await up.getPastVotes(other1, blockNumber + 1)
        )
      })

      it('generally returns the voting balance at the appropriate checkpoint', async () => {
        const t1 = await up.connect(holderSigner).delegate(other1)
        await advanceBlock()
        await advanceBlock()
        const t2 = await up.connect(holderSigner).transfer(other2, 10)
        await advanceBlock()
        await advanceBlock()
        const t3 = await up.connect(holderSigner).transfer(other2, 10)
        await advanceBlock()
        await advanceBlock()
        const t4 = await up
          .connect(await ethers.getSigner(other2))
          .transfer(holder, 20)
        await advanceBlock()
        await advanceBlock()

        compareBigNumbers(
          '0',
          await up.getPastVotes(other1, t1.blockNumber - 1)
        )
        compareBigNumbers(supply, await up.getPastVotes(other1, t1.blockNumber))
        compareBigNumbers(
          supply,
          await up.getPastVotes(other1, t1.blockNumber + 1)
        )
        compareBigNumbers(
          '99999990',
          await up.getPastVotes(other1, t2.blockNumber)
        )
        compareBigNumbers(
          '99999990',
          await up.getPastVotes(other1, t2.blockNumber + 1)
        )
        compareBigNumbers(
          '99999980',
          await up.getPastVotes(other1, t3.blockNumber)
        )
        compareBigNumbers(
          '99999980',
          await up.getPastVotes(other1, t3.blockNumber + 1)
        )
        compareBigNumbers(supply, await up.getPastVotes(other1, t4.blockNumber))
        compareBigNumbers(
          supply,
          await up.getPastVotes(other1, t4.blockNumber + 1)
        )
      })
    })
  })
})
