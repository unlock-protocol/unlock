// tests adapted/imported from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/7e41bf2259950c33e55604015875b7780b6a2e63/test/token/ERC20/extensions/ERC20VotesComp.test.js
const { ethers } = require('hardhat')
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

const supply = ethers.BigNumber.from('10000000000000000000000000')

describe('UDT ERC20VotesComp extension', () => {
  let udt
  let holderSigner, recipientSigner
  let minter, holder, recipient, holderDelegatee, other1, other2

  beforeEach(async () => {
    ;[
      { address: minter },
      holderSigner,
      recipientSigner,
      { address: holderDelegatee },
      { address: other1 },
      { address: other2 },
    ] = await ethers.getSigners()
    ;({ address: holder } = holderSigner)
    ;({ address: recipient } = recipientSigner)

    const UnlockDiscountTokenV3 = await ethers.getContractFactory(
      'UnlockDiscountTokenV3'
    )
    udt = await UnlockDiscountTokenV3.deploy()
    await udt['initialize(address)'](minter)
  })

  describe('Supply', () => {
    describe('balanceOf', () => {
      it('grants initial supply to minter account', async () => {
        await udt.mint(holder, supply)
        assert(supply.eq(await udt.balanceOf(holder)))
      })
    })
    it('minting restriction', async () => {
      const amount = ethers.BigNumber.from('2').pow('96')
      await reverts(
        udt.mint(minter, amount),
        'ERC20Votes: total supply risks overflowing votes'
      )
    })
  })

  describe('Delegation', () => {
    it('delegation with balance', async () => {
      await udt.mint(holder, supply)
      assert.equal(await udt.delegates(minter), ADDRESS_ZERO)
      const tx = await udt.connect(holderSigner).delegate(holder)
      const { events, blockNumber } = await tx.wait()

      // console.log(events)
      expectEvent(events, 'DelegateChanged', {
        delegator: holder,
        fromDelegate: ADDRESS_ZERO,
        toDelegate: holder,
      })
      expectEvent(events, 'DelegateVotesChanged', {
        delegate: holder,
        previousBalance: '0',
        newBalance: supply,
      })

      compareBigNumbers(supply, await udt.getCurrentVotes(holder))
      compareBigNumbers('0', await udt.getPriorVotes(holder, blockNumber - 1))
      await advanceBlock()
      compareBigNumbers(supply, await udt.getPriorVotes(holder, blockNumber))
    })
    it('delegation without balance', async () => {
      assert.equal(await udt.delegates(holder), ADDRESS_ZERO)

      const tx = await udt.connect(holderSigner).delegate(holder)
      const { events } = await tx.wait()

      expectEvent(events, 'DelegateChanged', {
        delegator: holder,
        fromDelegate: ADDRESS_ZERO,
        toDelegate: holder,
      })
      notExpectEvent(events, 'DelegateVotesChanged')

      assert.equal(await udt.delegates(holder), holder)
    })

    describe('change delegation', () => {
      beforeEach(async () => {
        await udt.mint(holder, supply)
        await udt.connect(holderSigner).delegate(holder)
      })

      it('call', async () => {
        assert.equal(await udt.delegates(holder), holder)

        const tx = await udt.connect(holderSigner).delegate(holderDelegatee)
        const { events, blockNumber } = await tx.wait()

        expectEvent(events, 'DelegateChanged', {
          delegator: holder,
          fromDelegate: holder,
          toDelegate: holderDelegatee,
        })
        expectEvent(events, 'DelegateVotesChanged', {
          delegate: holder,
          previousBalance: supply,
          newBalance: '0',
        })
        expectEvent(events, 'DelegateVotesChanged', {
          delegate: holderDelegatee,
          previousBalance: '0',
          newBalance: supply,
        })

        assert.equal(await udt.delegates(holder), holderDelegatee)
        compareBigNumbers('0', await udt.getCurrentVotes(holder))
        compareBigNumbers(supply, await udt.getCurrentVotes(holderDelegatee))

        compareBigNumbers(
          supply,
          await udt.getPriorVotes(holder, blockNumber - 1)
        )

        compareBigNumbers(
          '0',
          await udt.getPriorVotes(holderDelegatee, blockNumber - 1)
        )

        await advanceBlock()
        compareBigNumbers('0', await udt.getPriorVotes(holder, blockNumber))

        compareBigNumbers(
          supply,
          await udt.getPriorVotes(holderDelegatee, blockNumber)
        )
      })
    })
  })

  describe('Transfers', () => {
    let holderVotes
    let recipientVotes

    beforeEach(async () => {
      await udt.mint(holder, supply)
    })
    it('no delegation', async () => {
      const tx = await udt.connect(holderSigner).transfer(recipient, 1)
      const { events } = await tx.wait()
      expectEvent(events, 'Transfer', {
        from: holder,
        to: recipient,
        value: '1',
      })
      notExpectEvent(events, 'DelegateVotesChanged')

      holderVotes = '0'
      recipientVotes = '0'
    })

    it('sender delegation', async () => {
      await udt.connect(holderSigner).delegate(holder)

      const tx = await udt.connect(holderSigner).transfer(recipient, 1)
      const { events } = await tx.wait()
      expectEvent(events, 'Transfer', {
        from: holder,
        to: recipient,
        value: '1',
      })
      expectEvent(events, 'DelegateVotesChanged', {
        delegate: holder,
        previousBalance: supply,
        newBalance: supply.sub(1),
      })

      holderVotes = supply.sub(1)
      recipientVotes = '0'
    })

    it('receiver delegation', async () => {
      await udt.connect(recipientSigner).delegate(recipient)

      const tx = await udt.connect(holderSigner).transfer(recipient, 1)
      const { events } = await tx.wait()
      expectEvent(events, 'Transfer', {
        from: holder,
        to: recipient,
        value: '1',
      })
      expectEvent(events, 'DelegateVotesChanged', {
        delegate: recipient,
        previousBalance: '0',
        newBalance: '1',
      })

      holderVotes = '0'
      recipientVotes = '1'
    })

    it('full delegation', async () => {
      await udt.connect(holderSigner).delegate(holder)
      await udt.connect(recipientSigner).delegate(recipient)

      const tx = await udt.connect(holderSigner).transfer(recipient, 1)
      const { events } = await tx.wait()
      expectEvent(events, 'Transfer', {
        from: holder,
        to: recipient,
        value: '1',
      })
      expectEvent(events, 'DelegateVotesChanged', {
        delegate: holder,
        previousBalance: supply,
        newBalance: supply.sub(1),
      })
      expectEvent(events, 'DelegateVotesChanged', {
        delegate: recipient,
        previousBalance: '0',
        newBalance: '1',
      })

      holderVotes = supply.sub(1)
      recipientVotes = '1'
    })

    afterEach(async () => {
      compareBigNumbers(holderVotes, await udt.getCurrentVotes(holder))
      compareBigNumbers(recipientVotes, await udt.getCurrentVotes(recipient))

      // need to advance 2 blocks to see the effect of a transfer on "getPriorVotes"
      const blockNumber = (await getLatestBlock()).toString()
      await advanceBlock()
      compareBigNumbers(
        holderVotes,
        await udt.getPriorVotes(holder, blockNumber)
      )
      compareBigNumbers(
        recipientVotes,
        await udt.getPriorVotes(recipient, blockNumber)
      )
    })
  })

  describe('Compound test suite', () => {
    beforeEach(async () => {
      await udt.mint(holder, supply)
    })

    describe('balanceOf', () => {
      it('grants to initial account', async () => {
        assert.equal(
          (await udt.balanceOf(holder)).toString(),
          '10000000000000000000000000'
        )
      })
    })

    describe('numCheckpoints', () => {
      it('returns the number of checkpoints for a delegate', async () => {
        await udt.connect(holderSigner).transfer(recipient, '100') // give an account a few tokens for readability
        compareBigNumbers('0', await udt.numCheckpoints(other1))

        const t1 = await udt.connect(recipientSigner).delegate(other1)
        compareBigNumbers('1', await udt.numCheckpoints(other1))

        const t2 = await udt.connect(recipientSigner).transfer(other2, 10)
        compareBigNumbers('2', await udt.numCheckpoints(other1))

        const t3 = await udt.connect(recipientSigner).transfer(other2, 10)
        compareBigNumbers('3', await udt.numCheckpoints(other1))

        const t4 = await udt.connect(holderSigner).transfer(recipient, 20)
        compareBigNumbers('4', await udt.numCheckpoints(other1))

        compareBigNumberArrays(await udt.checkpoints(other1, 0), [
          t1.blockNumber.toString(),
          '100',
        ])
        compareBigNumberArrays(await udt.checkpoints(other1, 1), [
          t2.blockNumber.toString(),
          '90',
        ])
        compareBigNumberArrays(await udt.checkpoints(other1, 2), [
          t3.blockNumber.toString(),
          '80',
        ])
        compareBigNumberArrays(await udt.checkpoints(other1, 3), [
          t4.blockNumber.toString(),
          '100',
        ])

        await advanceBlock()
        compareBigNumbers(
          '100',
          await udt.getPriorVotes(other1, t1.blockNumber)
        )

        compareBigNumbers('90', await udt.getPriorVotes(other1, t2.blockNumber))

        compareBigNumbers('80', await udt.getPriorVotes(other1, t3.blockNumber))

        compareBigNumbers(
          '100',
          await udt.getPriorVotes(other1, t4.blockNumber)
        )
      })
    })

    describe('getPriorVotes', () => {
      it('reverts if block number >= current block', async () => {
        await reverts(
          udt.getPriorVotes(other1, 5e10),
          'ERC20Votes: block not yet mined'
        )
      })

      it('returns 0 if there are no checkpoints', async () => {
        compareBigNumbers('0', await udt.getPriorVotes(other1, 0))
      })

      it('returns the latest block if >= last checkpoint block', async () => {
        const t1 = await udt.connect(holderSigner).delegate(other1)
        const { blockNumber } = await t1.wait()
        await advanceBlock()
        await advanceBlock()

        compareBigNumbers(
          '10000000000000000000000000',
          await udt.getPriorVotes(other1, blockNumber)
        )

        compareBigNumbers(
          '10000000000000000000000000',
          await udt.getPriorVotes(other1, blockNumber + 1)
        )
      })

      it('returns zero if < first checkpoint block', async () => {
        await advanceBlock()
        const t1 = await udt.connect(holderSigner).delegate(other1)
        const { blockNumber } = await t1.wait()
        await advanceBlock()
        await advanceBlock()

        compareBigNumbers('0', await udt.getPriorVotes(other1, blockNumber - 1))

        compareBigNumbers(
          '10000000000000000000000000',
          await udt.getPriorVotes(other1, blockNumber + 1)
        )
      })

      it('generally returns the voting balance at the appropriate checkpoint', async () => {
        const t1 = await udt.connect(holderSigner).delegate(other1)
        await advanceBlock()
        await advanceBlock()
        const t2 = await udt.connect(holderSigner).transfer(other2, 10)
        await advanceBlock()
        await advanceBlock()
        const t3 = await udt.connect(holderSigner).transfer(other2, 10)
        await advanceBlock()
        await advanceBlock()
        const t4 = await udt
          .connect(await ethers.getSigner(other2))
          .transfer(holder, 20)
        await advanceBlock()
        await advanceBlock()

        compareBigNumbers(
          '0',
          await udt.getPriorVotes(other1, t1.blockNumber - 1)
        )
        compareBigNumbers(
          '10000000000000000000000000',
          await udt.getPriorVotes(other1, t1.blockNumber)
        )
        compareBigNumbers(
          '10000000000000000000000000',
          await udt.getPriorVotes(other1, t1.blockNumber + 1)
        )
        compareBigNumbers(
          '9999999999999999999999990',
          await udt.getPriorVotes(other1, t2.blockNumber)
        )
        compareBigNumbers(
          '9999999999999999999999990',
          await udt.getPriorVotes(other1, t2.blockNumber + 1)
        )
        compareBigNumbers(
          '9999999999999999999999980',
          await udt.getPriorVotes(other1, t3.blockNumber)
        )
        compareBigNumbers(
          '9999999999999999999999980',
          await udt.getPriorVotes(other1, t3.blockNumber + 1)
        )
        compareBigNumbers(
          '10000000000000000000000000',
          await udt.getPriorVotes(other1, t4.blockNumber)
        )
        compareBigNumbers(
          '10000000000000000000000000',
          await udt.getPriorVotes(other1, t4.blockNumber + 1)
        )
      })
    })
  })

  describe('getPastTotalSupply', () => {
    beforeEach(async () => {
      await udt.connect(holderSigner).delegate(holder)
    })

    it('reverts if block number >= current block', async () => {
      await reverts(
        udt.getPastTotalSupply(5e10),
        'ERC20Votes: block not yet mined'
      )
    })

    it('returns 0 if there are no checkpoints', async () => {
      compareBigNumbers('0', await udt.getPastTotalSupply(0))
    })

    it('returns the latest block if >= last checkpoint block', async () => {
      const t1 = await udt.mint(holder, supply)

      await advanceBlock()
      await advanceBlock()

      compareBigNumbers(supply, await udt.getPastTotalSupply(t1.blockNumber))

      compareBigNumbers(
        supply,
        await udt.getPastTotalSupply(t1.blockNumber + 1)
      )
    })

    it('returns zero if < first checkpoint block', async () => {
      await advanceBlock()
      const t1 = await udt.mint(holder, supply)
      await advanceBlock()
      await advanceBlock()

      compareBigNumbers('0', await udt.getPastTotalSupply(t1.blockNumber - 1))

      compareBigNumbers(
        '10000000000000000000000000',
        await udt.getPastTotalSupply(t1.blockNumber + 1)
      )
    })

    it('generally returns the voting balance at the appropriate checkpoint', async () => {
      const t1 = await udt.mint(holder, supply)
      await advanceBlock()
      await advanceBlock()
      const t2 = await udt.mint(holder, 10)
      await advanceBlock()
      await advanceBlock()
      const t3 = await udt.mint(holder, 10)
      await advanceBlock()
      await advanceBlock()
      const t4 = await udt.mint(holder, 20)
      await advanceBlock()
      await advanceBlock()

      compareBigNumbers('0', await udt.getPastTotalSupply(t1.blockNumber - 1))

      compareBigNumbers(
        '10000000000000000000000000',
        await udt.getPastTotalSupply(t1.blockNumber)
      )

      compareBigNumbers(
        '10000000000000000000000000',
        await udt.getPastTotalSupply(t1.blockNumber + 1)
      )

      compareBigNumbers(
        '10000000000000000000000010',
        await udt.getPastTotalSupply(t2.blockNumber)
      )

      compareBigNumbers(
        '10000000000000000000000010',
        await udt.getPastTotalSupply(t2.blockNumber + 1)
      )

      compareBigNumbers(
        '10000000000000000000000020',
        await udt.getPastTotalSupply(t3.blockNumber)
      )

      compareBigNumbers(
        '10000000000000000000000020',
        await udt.getPastTotalSupply(t3.blockNumber + 1)
      )

      compareBigNumbers(
        '10000000000000000000000040',
        await udt.getPastTotalSupply(t4.blockNumber)
      )

      compareBigNumbers(
        '10000000000000000000000040',
        await udt.getPastTotalSupply(t4.blockNumber + 1)
      )
    })
  })
})
