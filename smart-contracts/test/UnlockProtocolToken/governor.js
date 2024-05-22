const { ethers, upgrades } = require('hardhat')
const { assert } = require('chai')
const {
  ADDRESS_ZERO,
  getLatestBlock,
  advanceBlock,
  advanceBlockTo,
  reverts,
} = require('../helpers')
const deployContracts = require('../fixtures/deploy')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const PROPOSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PROPOSER_ROLE'))

// default values
const SIX_DAYS = 43200 // in blocks
const votingDelay = SIX_DAYS //
const votingPeriod = SIX_DAYS
const defaultQuorum = BigInt('3000') * BigInt(10 ** 18)

describe('UP Governor & Timelock', () => {
  let gov
  let udt

  // helper to recreate voting process
  const launchVotingProcess = async (voter, proposal) => {
    const proposalTx = await gov.propose(...proposal)

    const receipt = await proposalTx.wait()
    const evt = await getEvent(receipt, 'ProposalCreated')
    const { proposalId } = evt.args

    // proposale exists but does not accep votes yet
    assert.equal(await gov.state(proposalId), 0) // Pending

    // wait for voting delay
    const timepoint = await gov.proposalSnapshot(proposalId)
    await advanceBlockTo(timepoint + 1n)

    // now ready to receive votes
    assert.equal(await gov.state(proposalId), 1) // Active

    // vote
    gov = gov.connect(voter)
    await gov.castVote(proposalId, 1)

    // wait until voting delay is over
    const deadline = await gov.proposalDeadline(proposalId)
    await advanceBlockTo(deadline + 1n)

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
    return execReceipt
  }

  before(async () => {
    ;({ udt } = await deployContracts())
  })

  beforeEach(async () => {
    // deploying timelock with a proxy
    const UPTimelock = await ethers.getContractFactory('UPTimelock')

    const timelock = await upgrades.deployProxy(UPTimelock, [
      1, // 1 second delay
      [], // proposers list is empty at deployment
      [ADDRESS_ZERO], // allow any address to execute a proposal once the timelock has expired
    ])

    // deploy governor
    const UPGovernor = await ethers.getContractFactory('UPGovernor')

    gov = await upgrades.deployProxy(UPGovernor, [
      await udt.getAddress(),
      await timelock.getAddress(),
    ])

    // grant role
    await timelock.grantRole(PROPOSER_ROLE, await gov.getAddress())
  })

  describe('Default values', () => {
    it('default delay is set properly', async () => {
      assert.equal(await gov.votingDelay(), votingDelay)
    })

    it('voting period is 1 week', async () => {
      assert.equal(await gov.votingPeriod(), votingPeriod)
    })

    it('quorum is 30k UDT', async () => {
      assert.equal(await gov.quorum(1), defaultQuorum)
    })
  })

  describe('Update voting params', () => {
    it('should only be possible through voting', async () => {
      assert.equal(await gov.votingDelay(), votingDelay)
      await reverts(gov.setVotingDelay(2), 'GovernorOnlyExecutor')
      await reverts(gov.setQuorum(2), 'GovernorOnlyExecutor')
      await reverts(gov.setVotingPeriod(2), 'GovernorOnlyExecutor')
    })

    beforeEach(async () => {
      const quorum = ethers.parseUnits('15000.0', 18)
      const [owner, minter, voter] = await ethers.getSigners()

      // get tokens
      udt = await udt.connect(minter)
      await udt.mint(await owner.getAddress(), quorum)

      // give voter a few more tokens of its own to make sure we are above quorum
      await udt.mint(await minter.getAddress(), ethers.parseUnits('10.0', 18))
      await udt.delegate(await voter.getAddress())

      // delegate votes
      udt = await udt.connect(owner)
      const tx = await udt.delegate(await voter.getAddress())
      await tx.wait()

      assert.equal(
        (await udt.getVotes(await voter.getAddress())) > quorum,
        true
      )
    })

    describe('Quorum', () => {
      it('should be properly updated through voting', async () => {
        const quorum = ethers.parseUnits('35.0', 18)

        const [, , voter] = await ethers.getSigners()
        const encoded = gov.interface.encodeFunctionData('setQuorum', [quorum])

        // propose
        const proposal = [
          [await gov.getAddress()],
          ['0'],
          [encoded],
          '<proposal description: update the quorum>',
        ]

        const execReceipt = await launchVotingProcess(voter, proposal)

        const lastBlock = await getLatestBlock()
        await advanceBlock()

        // make sure quorum has been changed succesfully
        const changed = await gov.quorum(lastBlock)
        assert.equal(changed == quorum, true)

        // make sure event has been fired
        const { args } = await getEvent(execReceipt, 'QuorumSet')
        const { oldQuorum, newQuorum } = args
        assert.equal(newQuorum == quorum, true)
        assert.equal(oldQuorum, defaultQuorum)
      })
    })

    describe('VotingPeriod', () => {
      it('should be properly updated through voting', async () => {
        const votingPeriod = 10

        const [, , voter] = await ethers.getSigners()
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

        const [, , voter] = await ethers.getSigners()
        const encoded = gov.interface.encodeFunctionData('setVotingDelay', [
          votingDelay,
        ])

        const proposal = [
          [await gov.getAddress()],
          ['0'],
          [encoded],
          '<proposal description>',
        ]

        const execTx = await launchVotingProcess(voter, proposal)

        const changed = await gov.votingDelay()
        assert.equal(changed == votingDelay, true)

        // make sure event has been fired
        const { args } = await getEvent(execTx, 'VotingDelaySet')
        const { newVotingDelay } = args
        assert.equal(newVotingDelay, votingDelay)
      })
    })
  })
})
