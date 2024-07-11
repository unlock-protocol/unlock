const { ethers, upgrades } = require('hardhat')
const { assert } = require('chai')
const {
  ADDRESS_ZERO,
  increaseTime,
  increaseTimeTo,
  reverts,
} = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const PROPOSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PROPOSER_ROLE'))

// default values
const SIX_DAYS = 6 * 24 * 60 * 60 // in seconds
const votingDelay = SIX_DAYS
const votingPeriod = SIX_DAYS
const defaultQuorumNumerator = 3n
const defaultQuorumDenominator = 1000n

describe('UPToken Governor & Timelock', () => {
  let gov
  let up
  let transferToken
  let admin, delegater, voter, resetter
  let expectedQuorum

  // helper to recreate voting process
  const launchVotingProcess = async (voter, proposal) => {
    const proposalTx = await gov.propose(...proposal)

    const receipt = await proposalTx.wait()
    const evt = await getEvent(receipt, 'ProposalCreated')
    const { proposalId } = evt.args

    // proposal exists but does not accept votes yet
    assert.equal(await gov.state(proposalId), 0) // Pending

    // wait for voting delay
    const timepoint = await gov.proposalSnapshot(proposalId)
    await increaseTimeTo(timepoint + 1n)

    // now ready to receive votes
    assert.equal(await gov.state(proposalId), 1) // Active

    // vote
    gov = gov.connect(voter)
    await gov.castVote(proposalId, 1)
    await increaseTime()

    // const { timestamp } = await ethers.provider.getBlock()
    // console.log(await gov.proposalVotes(proposalId, timestamp))
    // wait until voting delay is over
    const deadline = await gov.proposalDeadline(proposalId)
    await increaseTimeTo(deadline + 1n)

    assert.equal(await gov.state(proposalId), 4) // Succeeded

    // get params
    const descriptionHash = ethers.keccak256(
      ethers.toUtf8Bytes(proposal.slice(-1).find(Boolean))
    )
    const [targets, values, calldatas] = proposal

    // queue proposal in timelock
    await gov.queue(targets, values, calldatas, descriptionHash)
    assert.equal(await gov.state(proposalId), 5) // Queued

    // execute the proposal
    const tx = await gov.execute(targets, values, calldatas, descriptionHash)
    assert.equal(await gov.state(proposalId), 7) // Executed

    const execReceipt = await tx.wait()
    const execEvent = await getEvent(execReceipt, 'ProposalExecuted')
    assert.notEqual(execEvent, null) // Executed
    await increaseTime()
    return execReceipt
  }

  before(async () => {
    ;[admin, delegater, voter, resetter] = await ethers.getSigners()

    // deploy UP
    const UP = await ethers.getContractFactory('UPToken')
    up = await upgrades.deployProxy(UP, [await admin.getAddress()])

    // mock swap
    const MockUPSwap = await ethers.getContractFactory('MockUPSwap')
    const swap = await MockUPSwap.deploy(await up.getAddress())

    // premint tokens to swap
    await up.mint(await swap.getAddress())

    // helper function to transfer from mock swap contract
    transferToken = async (receiver, amount) => {
      return await swap.transfer(receiver, amount)
    }

    // deploying timelock with a proxy
    const UPTimelock = await ethers.getContractFactory('UPTimelock')
    const timelock = await upgrades.deployProxy(UPTimelock, [
      1, // 1 second delay
      [], // proposers list is empty at deployment
      [ADDRESS_ZERO], // allow any address to execute a proposal once the timelock has expired
      await admin.getAddress(),
    ])

    // deploy governor
    const UPGovernor = await ethers.getContractFactory('UPGovernor')
    gov = await upgrades.deployProxy(UPGovernor, [
      await up.getAddress(),
      await timelock.getAddress(),
    ])

    // grant role
    await timelock.grantRole(PROPOSER_ROLE, await gov.getAddress())

    // increase time so the quorum is taken into account
    await increaseTime()

    expectedQuorum =
      ((await up.TOTAL_SUPPLY()) * 10n ** 18n * defaultQuorumNumerator) /
      defaultQuorumDenominator
  })

  describe('Default values', () => {
    it('default delay is set properly', async () => {
      assert.equal(await gov.votingDelay(), votingDelay)
    })

    it('voting period is 1 week', async () => {
      assert.equal(await gov.votingPeriod(), votingPeriod)
    })

    it('default quorum is 0.3% of total supply', async () => {
      const { timestamp } = await ethers.provider.getBlock()
      assert.equal(await gov.quorumNumerator(), defaultQuorumNumerator)
      assert.equal(await gov.quorumDenominator(), defaultQuorumDenominator)
      assert.equal(
        await gov['quorumNumerator(uint256)'](timestamp),
        defaultQuorumNumerator
      )
      assert.equal(await gov.quorum(timestamp - 1), expectedQuorum)
    })
  })

  describe('Update voting params', () => {
    before(async () => {
      // transfer and delegate anout tokens for voter to reach quorum alone
      await transferToken(await delegater.getAddress(), expectedQuorum + 1n)
      await up.connect(delegater).delegate(await voter.getAddress())

      const { timestamp } = await ethers.provider.getBlock()
      await increaseTime()

      // make sure voter as enough vote
      assert.equal(
        (await up.getVotes(await voter.getAddress())) >
          (await gov.quorum(timestamp)),
        true
      )
    })

    it('should only be possible through voting', async () => {
      assert.equal(await gov.votingDelay(), votingDelay)
      await reverts(gov.setVotingDelay(2), 'GovernorOnlyExecutor')
      await reverts(gov.updateQuorumNumerator(2), 'GovernorOnlyExecutor')
      await reverts(gov.setVotingPeriod(2), 'GovernorOnlyExecutor')
    })

    describe('Quorum', () => {
      it('should be properly updated through voting', async () => {
        const newQuorumNumerator = 10n

        const encoded = gov.interface.encodeFunctionData(
          'updateQuorumNumerator',
          [newQuorumNumerator]
        )

        // propose
        const proposal = [
          [await gov.getAddress()],
          ['0'],
          [encoded],
          '<proposal description: update the quorum>',
        ]

        const execReceipt = await launchVotingProcess(voter, proposal)

        // make sure quorum has been changed succesfully
        const { timestamp } = await ethers.provider.getBlock(
          execReceipt.blockNumber
        )

        assert.equal(await gov.quorumNumerator(), newQuorumNumerator)
        assert.equal(
          await gov.quorum(timestamp),
          ((await up.TOTAL_SUPPLY()) * 10n ** 18n * newQuorumNumerator) /
            defaultQuorumDenominator
        )

        // make sure event has been fired
        const { args } = await getEvent(execReceipt, 'QuorumNumeratorUpdated')

        assert.equal(args.newQuorumNumerator, newQuorumNumerator)
        assert.equal(args.oldQuorumNumerator, defaultQuorumNumerator)
      })
    })

    describe('VotingPeriod', () => {
      it('should be properly updated through voting', async () => {
        const votingPeriod = 10

        const encoded = gov.interface.encodeFunctionData('setVotingPeriod', [
          votingPeriod,
        ])

        // propose
        const proposal = [
          [await gov.getAddress()],
          ['0'],
          [encoded],
          '<proposal description>',
        ]

        const execTx = await launchVotingProcess(voter, proposal)

        const changed = await gov.votingPeriod()
        assert.equal(changed == votingPeriod, true)

        // make sure event has been fired
        const { args } = await getEvent(execTx, 'VotingPeriodSet')
        const { newVotingPeriod } = args
        assert.equal(newVotingPeriod == votingPeriod, true)
      })
    })

    describe('VotingDelay', () => {
      it('should be properly updated through voting', async () => {
        const votingDelay = 10000n
        const encoded = gov.interface.encodeFunctionData('setVotingDelay', [
          votingDelay,
        ])

        const proposal = [
          [await gov.getAddress()],
          ['0'],
          [encoded],
          '<proposal description>',
        ]

        const execReceipt = await launchVotingProcess(voter, proposal)
        const changed = await gov.votingDelay()
        assert.equal(changed == votingDelay, true)

        // make sure event has been fired
        const { args } = await getEvent(execReceipt, 'VotingDelaySet')
        const { newVotingDelay } = args
        assert.equal(newVotingDelay, votingDelay)
      })
    })

    afterEach(async () => {
      // reset to original state after tests
      const { timestamp } = await ethers.provider.getBlock()
      await increaseTime()
      const quorum = await gov.quorum(timestamp)

      // transfer and delegate anout tokens for voter to reach quorum alone
      if (quorum > expectedQuorum) {
        await transferToken(await resetter.getAddress(), quorum + 1n)
        await up.connect(resetter).delegate(await resetter.getAddress())
        await increaseTime()

        // reset quorum through proposal
        const proposal = [
          [await gov.getAddress()],
          ['0'],
          [
            gov.interface.encodeFunctionData('updateQuorumNumerator', [
              defaultQuorumNumerator,
            ]),
          ],
          `<proposal description: reset quorum ${Math.random()}>`,
        ]
        await launchVotingProcess(resetter, proposal)
      }
    })
  })
})
