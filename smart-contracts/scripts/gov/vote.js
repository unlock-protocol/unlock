const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { getProposalState } = require('../../helpers/gov')
const { getDelegates, impersonate } = require('../../test/helpers')

const vote = async (gov, voter, proposalId) => {
  const currentBlock = await ethers.provider.getBlockNumber()

  console.log(
    'GOV VOTE >',
    `voter ${voter.address}: power ${ethers.utils.formatUnits(
      await gov.getVotes(voter.address, currentBlock - 1),
      18
    )} `,
    `(quorum ${ethers.utils.formatUnits(
      await gov.quorum(currentBlock - 1),
      18
    )})`
  )

  const tx = await gov.connect(voter).castVote(proposalId, '1')
  const { events, transactionHash } = await tx.wait()
  const evt = events.find((v) => v.event === 'VoteCast')

  // double check vote happened
  const hasVotedAfter = await gov.hasVoted(proposalId, voter.address)

  // check for failure
  if (!evt || !hasVotedAfter) {
    throw new Error('GOV VOTE > Vote not casted.')
  }
  // eslint-disable-next-line no-console
  console.log(
    `GOV VOTE > vote casted: ${
      voter.address
    } approves (weigth: ${evt.args.weight.toString()}) (txid: ${transactionHash})`
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

  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)

  let voter
  if (isDev) {
    if (!voter) {
      // No voter equals to authoritarian mode: a single voter win!
      if (process.env.RUN_FORK === '1') {
        if (!voterAddress) {
          ;[voter] = await getDelegates()
        } else {
          voter = await impersonate(voterAddress)
        }
      } else {
        ;[, , voter] = await ethers.getSigners()
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
      const originBlock = ethers.BigNumber.from(proposalBlock || currentBlock)
      const targetBlock = originBlock.add(votingDelay)
      console.log(
        `GOV VOTE (dev): Skipping voting delay. Advancing time from block ${currentBlock} to ${targetBlock}`
      )
      await time.advanceBlockTo(targetBlock.toString())
    }
  }

  if (!voter && voterAddress) {
    voter = await ethers.getSigner(voterAddress)
  }

  const state = await getProposalState(proposalId, govAddress)
  if (state === 'Active') {
    const hasVoted = await gov.hasVoted(proposalId, voter.address)
    if (hasVoted) {
      // eslint-disable-next-line no-console
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
