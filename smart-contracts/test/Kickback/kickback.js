const { ethers, upgrades } = require('hardhat')
const { assert } = require('chai')
const {
  ADDRESS_ZERO,
  increaseTime,
  increaseTimeTo,
  reverts,
  deployContracts,
  deployLock,
  purchaseKeys,
} = require('../helpers')
const {
  getEvent,
  createLockCalldata,
} = require('@unlock-protocol/hardhat-helpers')

const keyPrice = ethers.parseEther('0.01')

describe('Kickback contract', () => {
  before(async () => {
    const [deployer] = await ethers.getSigners()

    // deploy unlock
    const { unlock } = await deployContracts()

    // create a new lock
    const lock = await deployLock()
    const { tokenIds, keyOwners } = await purchaseKeys(lock, 5)

    console.log(tokenIds, keyOwners, await lock.keyPrice())

    // Deploy a lock
    // Buy a few keys
  })

  describe('approveRefunds', () => {
    it('should fail if the Kickback contract is not a lock manager', () => {
      console.log('OKI HERE I GO!')
    })
    it('should fail if callers is not a lock manager')
    it('should store the root of the merkle tree')
  })

  describe('refund', () => {
    it(
      'should fail if the proof is invalid because the recipient is not in the list of recipients'
    )
    it('should fail if the proof is invalid because the amount is incorrect')
    it('should fail if the refund was already claimed')
    it('should withdraw funds for the user')
    // before(async () => {
    //   // transfer and delegate anout tokens for voter to reach quorum alone
    //   await up
    //     .connect(minter)
    //     .transfer(await delegater.getAddress(), expectedQuorum + 1n)
    //   await up.connect(delegater).delegate(await voter.getAddress())

    //   const { timestamp } = await ethers.provider.getBlock()
    //   await increaseTime()

    //   // make sure voter as enough vote
    //   assert.equal(
    //     (await up.getVotes(await voter.getAddress())) >
    //     (await gov.quorum(timestamp)),
    //     true
    //   )
    // })

    // it('should only be possible through voting', async () => {
    //   assert.equal(await gov.votingDelay(), votingDelay)
    //   await reverts(gov.setVotingDelay(2), 'GovernorOnlyExecutor')
    //   await reverts(gov.updateQuorumNumerator(2), 'GovernorOnlyExecutor')
    //   await reverts(gov.setVotingPeriod(2), 'GovernorOnlyExecutor')
    // })

    // describe('Quorum', () => {
    //   it('should be properly updated through voting', async () => {
    //     const newQuorumNumerator = 10n

    //     const encoded = gov.interface.encodeFunctionData(
    //       'updateQuorumNumerator',
    //       [newQuorumNumerator]
    //     )

    //     // propose
    //     const proposal = [
    //       [await gov.getAddress()],
    //       ['0'],
    //       [encoded],
    //       '<proposal description: update the quorum>',
    //     ]

    //     const execReceipt = await launchVotingProcess(voter, proposal)

    //     // make sure quorum has been changed succesfully
    //     const { timestamp } = await ethers.provider.getBlock(
    //       execReceipt.blockNumber
    //     )

    //     assert.equal(await gov.quorumNumerator(), newQuorumNumerator)
    //     assert.equal(
    //       await gov.quorum(timestamp),
    //       ((await up.TOTAL_SUPPLY()) * 10n ** 18n * newQuorumNumerator) /
    //       defaultQuorumDenominator
    //     )

    //     // make sure event has been fired
    //     const { args } = await getEvent(execReceipt, 'QuorumNumeratorUpdated')

    //     assert.equal(args.newQuorumNumerator, newQuorumNumerator)
    //     assert.equal(args.oldQuorumNumerator, defaultQuorumNumerator)
    //   })
    // })

    // describe('VotingPeriod', () => {
    //   it('should be properly updated through voting', async () => {
    //     const votingPeriod = 10

    //     const encoded = gov.interface.encodeFunctionData('setVotingPeriod', [
    //       votingPeriod,
    //     ])

    //     // propose
    //     const proposal = [
    //       [await gov.getAddress()],
    //       ['0'],
    //       [encoded],
    //       '<proposal description>',
    //     ]

    //     const execTx = await launchVotingProcess(voter, proposal)

    //     const changed = await gov.votingPeriod()
    //     assert.equal(changed == votingPeriod, true)

    //     // make sure event has been fired
    //     const { args } = await getEvent(execTx, 'VotingPeriodSet')
    //     const { newVotingPeriod } = args
    //     assert.equal(newVotingPeriod == votingPeriod, true)
    //   })
    // })

    // describe('VotingDelay', () => {
    //   it('should be properly updated through voting', async () => {
    //     const votingDelay = 10000n
    //     const encoded = gov.interface.encodeFunctionData('setVotingDelay', [
    //       votingDelay,
    //     ])

    //     const proposal = [
    //       [await gov.getAddress()],
    //       ['0'],
    //       [encoded],
    //       '<proposal description>',
    //     ]

    //     const execReceipt = await launchVotingProcess(voter, proposal)
    //     const changed = await gov.votingDelay()
    //     assert.equal(changed == votingDelay, true)

    //     // make sure event has been fired
    //     const { args } = await getEvent(execReceipt, 'VotingDelaySet')
    //     const { newVotingDelay } = args
    //     assert.equal(newVotingDelay, votingDelay)
    //   })
    // })

    // afterEach(async () => {
    //   // reset to original state after tests
    //   const { timestamp } = await ethers.provider.getBlock()
    //   await increaseTime()
    //   const quorum = await gov.quorum(timestamp)

    //   // transfer and delegate anout tokens for voter to reach quorum alone
    //   if (quorum > expectedQuorum) {
    //     await up
    //       .connect(minter)
    //       .transfer(await resetter.getAddress(), quorum + 1n)
    //     await up.connect(resetter).delegate(await resetter.getAddress())
    //     await increaseTime()

    //     // reset quorum through proposal
    //     const proposal = [
    //       [await gov.getAddress()],
    //       ['0'],
    //       [
    //         gov.interface.encodeFunctionData('updateQuorumNumerator', [
    //           defaultQuorumNumerator,
    //         ]),
    //       ],
    //       `<proposal description: reset quorum ${Math.random()}>`,
    //     ]
    //     await launchVotingProcess(resetter, proposal)
    //   }
    // })
  })
})
