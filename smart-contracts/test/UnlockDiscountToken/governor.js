const { time } = require('@openzeppelin/test-helpers')

const { reverts } = require('truffle-assertions')
const { ethers, upgrades, network } = require('hardhat')
const { getDeployment } = require('../../helpers/deployments')
const { errorMessages } = require('../helpers/constants')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages
const ZERO_ADDRESS = web3.utils.padLeft(0, 40)
// const TIMELOCK_ADMIN_ROLE = '0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5'
const PROPOSER_ROLE =
  '0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1'

contract('UnlockProtocolGovernor', () => {
  let gov
  let udt

  // helper to recreate voting process
  const launchVotingProcess = async (voter, proposal) => {
    const proposalTx = await gov.propose(...proposal)

    const { events } = await proposalTx.wait()
    const evt = events.find((v) => v.event === 'ProposalCreated')
    const { proposalId } = evt.args

    // proposale exists but does not accep votes yet
    assert.equal(await gov.state(proposalId), 0) // Pending

    // wait for a block (default voting delay)
    await time.advanceBlock()

    // now ready to receive votes
    assert.equal(await gov.state(proposalId), 1) // Active

    // vote
    gov = gov.connect(voter)
    await gov.castVote(proposalId, 1)

    // wait until voting delay is over
    const deadline = await gov.proposalDeadline(proposalId)
    await time.advanceBlockTo(deadline.toNumber())

    assert.equal(await gov.state(proposalId), 4) // Succeeded

    // get params
    const descriptionHash = web3.utils.keccak256(
      proposal.slice(-1).find(Boolean)
    )
    const [targets, values, calldatas] = proposal

    // queue proposal in timelock
    await gov.queue(targets, values, calldatas, descriptionHash)
    assert.equal(await gov.state(proposalId), 5) // Queued

    // execute the proposal
    await gov.execute(targets, values, calldatas, descriptionHash)
    assert.equal(await gov.state(proposalId), 7) // Executed
  }

  beforeEach(async () => {
    // deploying timelock with a proxy
    const UnlockProtocolTimelock = await ethers.getContractFactory(
      'UnlockProtocolTimelock'
    )

    const timelock = await upgrades.deployProxy(UnlockProtocolTimelock, [
      1, // 1 second delay
      [], // proposers list is empty at deployment
      [ZERO_ADDRESS], // allow any address to execute a proposal once the timelock has expired
    ])
    await timelock.deployed()

    const UDTInfo = await getDeployment(31337, 'UnlockDiscountTokenV2')
    const tokenAddress = UDTInfo.address

    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountTokenV2'
    )
    udt = await UnlockDiscountToken.attach(tokenAddress)

    // deploy governor
    const UnlockProtocolGovernor = await ethers.getContractFactory(
      'UnlockProtocolGovernor'
    )

    gov = await upgrades.deployProxy(UnlockProtocolGovernor, [
      tokenAddress,
      timelock.address,
    ])
    await gov.deployed()

    // grant role
    await timelock.grantRole(PROPOSER_ROLE, gov.address)
  })

  describe('Default values', () => {
    it('default delay is 1 block', async () => {
      assert.equal(await gov.votingDelay(), 1)
    })

    it('voting period is 1 week', async () => {
      assert.equal(await gov.votingPeriod(), 45818)
    })

    it('quorum is 15k UDT', async () => {
      assert.equal(await gov.quorum(1), 15000e18)
    })
  })

  describe('Update voting params', () => {
    it('should only be possible through voting', async () => {
      assert.equal(await gov.votingDelay(), 1)
      await reverts(
        gov.setVotingDelay(2),
        `${VM_ERROR_REVERT_WITH_REASON} 'Governor: onlyGovernance'`
      )
      await reverts(
        gov.setQuorum(2),
        `${VM_ERROR_REVERT_WITH_REASON} 'Governor: onlyGovernance'`
      )
      await reverts(
        gov.setVotingPeriod(2),
        `${VM_ERROR_REVERT_WITH_REASON} 'Governor: onlyGovernance'`
      )
    })

    const quorum = ethers.utils.parseUnits('15000.0', 18)

    beforeEach(async () => {
      const [owner, minter, voter] = await ethers.getSigners()

      // bring default voting period to 10 blocks for testing purposes
      await network.provider.send('hardhat_setStorageAt', [
        gov.address,
        '0x1c7', // '455' storage slot
        '0x0000000000000000000000000000000000000000000000000000000000000032', // 50 blocks
      ])

      // get tokens
      udt = await udt.connect(minter)
      await udt.mint(owner.address, quorum)

      // give voter a few more tokens of its own to make sure we are above quorum
      await udt.mint(minter.address, ethers.utils.parseUnits('10.0', 18))
      await udt.delegate(voter.address)

      // delegate votes
      udt = await udt.connect(owner)
      const tx = await udt.delegate(voter.address)
      await tx.wait()

      assert.equal((await udt.getVotes(voter.address)).gt(quorum), true)
    })

    describe('Quorum', () => {
      it('should be properly updated through voting', async () => {
        const newQuorum = ethers.utils.parseUnits('35.0', 18)

        const [, , voter] = await ethers.getSigners()
        const encoded = gov.interface.encodeFunctionData('setQuorum', [
          newQuorum,
        ])

        // propose
        const proposal = [
          [gov.address],
          [web3.utils.toWei('0')],
          [encoded],
          '<proposal description: update the quorum>',
        ]

        await launchVotingProcess(voter, proposal)

        const lastBlock = await time.latestBlock()
        await time.advanceBlock()

        // make sure quorum has been changed succesfully
        const changed = await gov.quorum(await lastBlock.toNumber())
        assert.equal(changed.eq(newQuorum), true)
      })
    })

    describe('VotingPeriod', () => {
      it('should be properly updated through voting', async () => {
        const newVotingPeriod = 10

        const [, , voter] = await ethers.getSigners()
        const encoded = gov.interface.encodeFunctionData('setVotingPeriod', [
          newVotingPeriod,
        ])

        // propose
        const proposal = [
          [gov.address],
          [web3.utils.toWei('0')],
          [encoded],
          '<proposal description: update the quorum>',
        ]

        await launchVotingProcess(voter, proposal)

        const changed = await gov.votingPeriod()
        assert.equal(changed.eq(newVotingPeriod), true)
      })
    })

    describe('VotingDelay', () => {
      it('should be properly updated through voting', async () => {
        const newVotingDelay = 10000

        const [, , voter] = await ethers.getSigners()
        const encoded = gov.interface.encodeFunctionData('setVotingDelay', [
          newVotingDelay,
        ])

        const proposal = [
          [gov.address],
          [web3.utils.toWei('0')],
          [encoded],
          '<proposal description: update the quorum>',
        ]

        await launchVotingProcess(voter, proposal)

        const changed = await gov.votingDelay()
        assert.equal(changed.eq(newVotingDelay), true)
      })
    })
  })
})
