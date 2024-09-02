const { ethers, upgrades } = require('hardhat')
const { assert } = require('chai')
const { ADDRESS_ZERO, reverts, increaseBlock } = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const PROPOSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PROPOSER_ROLE'))

// default values
const SIX_HUNDRED_BLOCKS = 600 // in blocks
const votingDelay = SIX_HUNDRED_BLOCKS
const votingPeriod = SIX_HUNDRED_BLOCKS

describe('UnlockProtocol Governor & Timelock', () => {
  let gov
  let udt
  let admin, delegater, voter, resetter

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
    const clock1 = await gov.clock()
    await increaseBlock(parseInt(timepoint - clock1 + 1n))

    // now ready to receive votes
    assert.equal(await gov.state(proposalId), 1) // Active

    // vote
    await gov.connect(voter).castVote(proposalId, 1)

    // wait until voting delay is over
    const deadline = await gov.proposalDeadline(proposalId)
    const clock2 = await gov.clock()
    await increaseBlock(parseInt(deadline - clock2 + 1n))

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
    await increaseBlock()
    return execReceipt
  }

  before(async () => {
    ;[admin, delegater, voter, resetter] = await ethers.getSigners()

    // deploy UP
    const UDT = await ethers.getContractFactory('UnlockDiscountTokenV3')
    udt = await upgrades.deployProxy(UDT, [await admin.getAddress()], {
      initializer: 'initialize(address)',
    })
    await udt.connect(admin).mint(await delegater.getAddress(), 5000)

    // deploying timelock with a proxy
    const UnlockProtocolTimelock = await ethers.getContractFactory(
      'UnlockProtocolTimelock'
    )
    const timelock = await upgrades.deployProxy(UnlockProtocolTimelock, [
      1, // 1 second delay
      [], // proposers list is empty at deployment
      [ADDRESS_ZERO], // allow any address to execute a proposal once the timelock has expired
    ])

    // deploy governor
    const UnlockProtocolGovernor = await ethers.getContractFactory(
      'UnlockProtocolGovernor'
    )
    gov = await upgrades.deployProxy(UnlockProtocolGovernor, [
      await udt.getAddress(),
      SIX_HUNDRED_BLOCKS,
      SIX_HUNDRED_BLOCKS,
      '0',
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
  })

  describe('Update voting params', () => {
    before(async () => {
      await udt.connect(delegater).delegate(await voter.getAddress())

      await increaseBlock()
    })

    it('should only be possible through voting', async () => {
      assert.equal(await gov.votingDelay(), votingDelay)
      await reverts(gov.setVotingDelay(2), 'Governor: onlyGovernance')
      await reverts(gov.setVotingPeriod(2), 'Governor: onlyGovernance')
      await reverts(gov.setQuorum(2), 'Governor: onlyGovernance')
    })

    describe('VotingPeriod', () => {
      it('should be properly updated through voting', async () => {
        const votingPeriod = SIX_HUNDRED_BLOCKS / 2
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
        const { args } = await getEvent(execTx, 'VotingPeriodUpdated')
        const { newVotingPeriod } = args
        assert.equal(newVotingPeriod == votingPeriod, true)
      })
    })

    describe('VotingDelay', () => {
      it('should be properly updated through voting', async () => {
        const votingDelay = SIX_HUNDRED_BLOCKS / 2
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
        const { args } = await getEvent(execReceipt, 'VotingDelayUpdated')
        const { newVotingDelay } = args
        assert.equal(newVotingDelay, votingDelay)
      })
    })

    describe('setQuorum', () => {
      it('should be properly updated through voting', async () => {
        const quorum = SIX_HUNDRED_BLOCKS / 2
        const encoded = gov.interface.encodeFunctionData('setQuorum', [quorum])

        const proposal = [
          [await gov.getAddress()],
          ['0'],
          [encoded],
          '<proposal description>',
        ]

        const execReceipt = await launchVotingProcess(voter, proposal)
        const changed = await gov.quorum(0)
        assert.equal(changed == quorum, true)

        // make sure event has been fired
        const { args } = await getEvent(execReceipt, 'QuorumUpdated')
        const { newQuorum } = args
        assert.equal(newQuorum, quorum)
      })
    })

    describe('Cancel', () => {
      it('should be properly cancelled', async () => {
        const votingDelay = 10000n
        const encoded = gov.interface.encodeFunctionData('setVotingDelay', [
          votingDelay,
        ])

        const proposal = [
          [await gov.getAddress()],
          ['1'],
          [encoded],
          '<proposal description for delay>',
        ]
        const proposalTx = await gov.propose(...proposal)

        const receipt = await proposalTx.wait()
        const evt = await getEvent(receipt, 'ProposalCreated')
        const { proposalId } = evt.args

        // proposal exists but does not accept votes yet
        assert.equal(await gov.state(proposalId), 0) // Pending

        // get params
        const descriptionHash = ethers.keccak256(
          ethers.toUtf8Bytes(proposal.slice(-1).find(Boolean))
        )
        const [targets, values, calldatas] = proposal

        await gov.cancel(targets, values, calldatas, descriptionHash)

        assert.equal(await gov.state(proposalId), 2) // Canceled
      })
    })

    describe('supportsInterface', async () => {
      it('should support id for IERC1155ReceiverUpgradeable', async () => {
        const interfaceId = '0x4e2312e0' // Interface Id of IERC1155ReceiverUpgradeable.sol
        const supportsGovernor = await gov.supportsInterface(interfaceId)
        assert.equal(supportsGovernor, true)
      })

      it('should not support random interface', async function () {
        const randomInterfaceId = '0x12345678'
        const supportsRandom = await gov.supportsInterface(randomInterfaceId)
        assert.equal(supportsRandom, false)
      })
    })
  })
})
