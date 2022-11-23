const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const {
  queueProposal,
  getProposalState,
  getProposalVotes,
  getProposalId,
} = require('../../helpers/gov')

async function main({ proposal, govAddress }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337

  const proposalId = proposal.proposalId || (await getProposalId(proposal))

  if (!proposalId) {
    throw new Error('GOV QUEUE > Missing proposal ID.')
  }

  // contract instance
  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)
  let state = await getProposalState(proposalId)

  // close voting period
  if (isDev && state === 'Active') {
    const deadline = await gov.proposalDeadline(proposalId)
    const currentBlock = await ethers.provider.getBlockNumber()
    if (currentBlock < deadline) {
      await time.advanceBlockTo(deadline.toNumber() + 1)
      // eslint-disable-next-line no-console
      console.log(
        `GOV QUEUE > closing voting period (advancing to block #${deadline.toNumber()})`
      )
      state = await getProposalState(proposalId)
    }
  }

  const votes = await getProposalVotes(proposalId)
  // eslint-disable-next-line no-console
  console.log(
    `GOV QUEUE > Current proposal ${state} - votes (against, for, abstain): ${votes}`
  )

  // queue proposal
  if (state === 'Succeeded') {
    const tx = await queueProposal({ proposalId })
    const { events, transactionHash } = await tx.wait()
    const evt = events.find((v) => v.event === 'ProposalQueued')
    const { eta } = evt.args
    // eslint-disable-next-line no-console
    console.log(
      `GOV QUEUE > Proposal queued. ETA :${new Date(
        eta.toNumber() * 1000
      )} (tx: ${transactionHash})`
    )
  } else if (state === 'Queued') {
    const eta = await gov.proposalEta(proposalId)
    // eslint-disable-next-line no-console
    console.log(
      `GOV QUEUE > Proposal is queued for execution. ETA :${new Date(
        eta.toNumber() * 1000
      )}`
    )
  } else {
    throw new Error(
      `GOV QUEUE > Proposal state (${state}) does not allow queue.`
    )
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
