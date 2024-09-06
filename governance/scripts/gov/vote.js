const { ethers } = require('hardhat')
const { mineUpTo } = require('@nomicfoundation/hardhat-network-helpers')
const { getProposalState, getDelegates } = require('../../helpers/gov')
const { impersonate, getEvent } = require('@unlock-protocol/hardhat-helpers')
const { GovernorUnlockProtocol } = require('@unlock-protocol/contracts')

const vote = async (gov, voter, proposalId) => {
  const currentBlock = await ethers.provider.getBlockNumber()

  console.log(
    'GOV VOTE >',
    `voter ${await voter.getAddress()}: power ${ethers.formatUnits(
      await gov.getVotes(await voter.getAddress(), currentBlock - 1),
      18
    )} `,
    `(quorum ${ethers.formatUnits(await gov.quorum(currentBlock - 1), 18)})`
  )

  const tx = await gov.connect(voter).castVote(proposalId, '1')
  const receipt = await tx.wait()
  const { event, hash } = await getEvent(receipt, 'VoteCast')

  // double check vote happened
  const hasVotedAfter = await gov.hasVoted(proposalId, voter.address)

  // check for failure
  if (!event || !hasVotedAfter) {
    throw new Error('GOV VOTE > Vote not casted.')
  }

  console.log(
    `GOV VOTE > vote casted: ${
      voter.address
    } approves (weigth: ${event.args.weight.toString()}) (txid: ${hash})`
  )
}

async function main({ voterAddress, proposalId, govAddress, proposalBlock }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337 || !!process.env.RUN_FORK

  if (!proposalId) {
    throw new Error('GOV VOTE > Missing proposal ID.')
  }
  console.log(`GOV VOTE > proposal ID : ${proposalId}`)

  const gov = await ethers.getContractAt(GovernorUnlockProtocol.abi, govAddress)

  let voter
  if (isDev) {
    if (!voter) {
      // No voter equals to authoritarian mode: a single voter win!
      if (process.env.RUN_FORK === '1' || process.env.RUN_FORK === '8453') {
        if (!voterAddress) {
          ;[voter] = await getDelegates()
        } else {
          voter = await impersonate(voterAddress)
        }
      } else {
        ;[voter] = await ethers.getSigners()
      }
      console.log(`GOV VOTE (dev) > Impersonate voter: ${voter.address}`)
    }
    // make sure proposal state is active
    const state = await getProposalState(proposalId, govAddress)
    if (state === 'Pending') {
      // wait for voting delay
      const votingDelay = await gov.votingDelay()
      const currentBlock = await ethers.provider.getBlockNumber()
      // if proposal block not specified, default to currentBlock
      const originBlock = BigInt(proposalBlock || currentBlock)
      const targetBlock = originBlock + votingDelay + BigInt('1')
      console.log(
        `GOV VOTE (dev): Skipping voting delay. Advancing time from block ${currentBlock} to ${targetBlock}`
      )
      await mineUpTo(targetBlock)
    }
  }

  if (!voter && voterAddress) {
    voter = await ethers.getSigner(voterAddress)
  }

  if (!voter) {
    ;[voter] = await ethers.getSigners()
  }

  const state = await getProposalState(proposalId, govAddress)
  if (state === 'Active') {
    const hasVoted = await gov.hasVoted(proposalId, await voter.getAddress())
    if (hasVoted) {
      console.log('GOV VOTE > voter already voted')
      return
    }
    await vote(gov, voter, proposalId)
  } else {
    throw new Error(`GOV VOTE > Proposal state (${state}) does not allow vote.`)
  }
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
