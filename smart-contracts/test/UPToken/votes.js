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
} = require('../helpers')

const supply = BigInt('100000000')

describe('UPToken / Votes', () => {
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

    // deploy UP token
    const UnlockProtocolToken = await ethers.getContractFactory('UPToken')
    up = await upgrades.deployProxy(UnlockProtocolToken, [owner])

    // mock swap
    const MockUPSwap = await ethers.getContractFactory('MockUPSwap')
    const swap = await MockUPSwap.deploy(await up.getAddress())
    await up.mint(await swap.getAddress())

    // helper function to transfer from mock swap contract
    transferToken = async (receiver, amount) => {
      return await swap.transfer(receiver, amount)
    }
  })

  describe('Supply', () => {
    describe('balanceOf', () => {
      it('grants initial supply to minter account', async () => {
        await transferToken(holder, supply)
        assert(supply == (await up.balanceOf(holder)))
      })
    })
  })

  describe('Delegation', () => {
    it('delegation with balance', async () => {
      await transferToken(holder, supply)
      assert.equal(await up.delegates(minter), ADDRESS_ZERO)
      const tx = await up.connect(holderSigner).delegate(holder)
      const receipt = await tx.wait()
      const { timestamp } = await ethers.provider.getBlock(receipt.blockNumber)

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
      compareBigNumbers('0', await up.getPastVotes(holder, timestamp - 1))
      await advanceBlock()
      compareBigNumbers(supply, await up.getPastVotes(holder, timestamp))
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
        const { timestamp } = await ethers.provider.getBlock(
          receipt.blockNumber
        )

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

        compareBigNumbers(supply, await up.getPastVotes(holder, timestamp - 1))

        compareBigNumbers(
          '0',
          await up.getPastVotes(holderDelegatee, timestamp - 1)
        )

        await advanceBlock()
        compareBigNumbers('0', await up.getPastVotes(holder, timestamp))

        compareBigNumbers(
          supply,
          await up.getPastVotes(holderDelegatee, timestamp)
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
      const { timestamp } = await ethers.provider.getBlock()
      await advanceBlock()
      compareBigNumbers(holderVotes, await up.getPastVotes(holder, timestamp))
      compareBigNumbers(
        recipientVotes,
        await up.getPastVotes(recipient, timestamp)
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

        const tx1 = await up.connect(recipientSigner).delegate(other1)
        const { timestamp: t1 } = await ethers.provider.getBlock(
          tx1.blockNumber
        )
        compareBigNumbers('1', await up.numCheckpoints(other1))

        const tx2 = await up.connect(recipientSigner).transfer(other2, 10)
        const { timestamp: t2 } = await ethers.provider.getBlock(
          tx2.blockNumber
        )
        compareBigNumbers('2', await up.numCheckpoints(other1))

        const tx3 = await up.connect(recipientSigner).transfer(other2, 10)
        const { timestamp: t3 } = await ethers.provider.getBlock(
          tx3.blockNumber
        )
        compareBigNumbers('3', await up.numCheckpoints(other1))

        const tx4 = await up.connect(holderSigner).transfer(recipient, 20)
        const { timestamp: t4 } = await ethers.provider.getBlock(
          tx4.blockNumber
        )
        compareBigNumbers('4', await up.numCheckpoints(other1))

        compareBigNumberArrays(await up.checkpoints(other1, 0), [t1, '100'])
        compareBigNumberArrays(await up.checkpoints(other1, 1), [t2, '90'])
        compareBigNumberArrays(await up.checkpoints(other1, 2), [t3, '80'])
        compareBigNumberArrays(await up.checkpoints(other1, 3), [t4, '100'])

        await advanceBlock()
        compareBigNumbers('100', await up.getPastVotes(other1, t1))
        compareBigNumbers('90', await up.getPastVotes(other1, t2))
        compareBigNumbers('80', await up.getPastVotes(other1, t3))
        compareBigNumbers('100', await up.getPastVotes(other1, t4))
      })
    })

    describe('getPastVotes', () => {
      it('reverts if timestamp >= current time', async () => {
        const { timestamp } = await ethers.provider.getBlock()
        await reverts(
          up.getPastVotes(other1, timestamp + 1),
          'ERC5805FutureLookup'
        )
      })

      it('returns 0 if there are no checkpoints', async () => {
        compareBigNumbers('0', await up.getPastVotes(other1, 0))
      })

      it('returns the latest block if >= last checkpoint block', async () => {
        const t1 = await up.connect(holderSigner).delegate(other1)
        const { blockNumber } = await t1.wait()
        const { timestamp } = await ethers.provider.getBlock(blockNumber)
        await advanceBlock()
        await advanceBlock()

        compareBigNumbers(supply, await up.getPastVotes(other1, timestamp))
        compareBigNumbers(supply, await up.getPastVotes(other1, timestamp + 1))
      })

      it('returns zero if < first checkpoint block', async () => {
        await advanceBlock()
        const t1 = await up.connect(holderSigner).delegate(other1)
        const { blockNumber } = await t1.wait()
        const { timestamp } = await ethers.provider.getBlock(blockNumber)
        await advanceBlock()
        await advanceBlock()

        compareBigNumbers('0', await up.getPastVotes(other1, timestamp - 1))
        compareBigNumbers(supply, await up.getPastVotes(other1, timestamp + 1))
      })

      it('generally returns the voting balance at the appropriate checkpoint', async () => {
        const tx1 = await up.connect(holderSigner).delegate(other1)
        const { timestamp: t1 } = await ethers.provider.getBlock(
          tx1.blockNumber
        )
        await advanceBlock()
        await advanceBlock()
        const tx2 = await up.connect(holderSigner).transfer(other2, 10)
        const { timestamp: t2 } = await ethers.provider.getBlock(
          tx2.blockNumber
        )
        await advanceBlock()
        await advanceBlock()
        const tx3 = await up.connect(holderSigner).transfer(other2, 10)
        const { timestamp: t3 } = await ethers.provider.getBlock(
          tx3.blockNumber
        )
        await advanceBlock()
        await advanceBlock()
        const tx4 = await up
          .connect(await ethers.getSigner(other2))
          .transfer(holder, 20)
        const { timestamp: t4 } = await ethers.provider.getBlock(
          tx4.blockNumber
        )
        await advanceBlock()
        await advanceBlock()

        compareBigNumbers('0', await up.getPastVotes(other1, t1 - 1))
        compareBigNumbers(supply, await up.getPastVotes(other1, t1))
        compareBigNumbers(supply, await up.getPastVotes(other1, t1 + 1))
        compareBigNumbers('99999990', await up.getPastVotes(other1, t2))
        compareBigNumbers('99999990', await up.getPastVotes(other1, t2 + 1))
        compareBigNumbers('99999980', await up.getPastVotes(other1, t3))
        compareBigNumbers('99999980', await up.getPastVotes(other1, t3 + 1))
        compareBigNumbers(supply, await up.getPastVotes(other1, t4))
        compareBigNumbers(supply, await up.getPastVotes(other1, t4 + 1))
      })
    })
  })
})
