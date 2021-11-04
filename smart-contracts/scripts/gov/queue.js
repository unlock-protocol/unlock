const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { getDeployment } = require('../../helpers/deployments')
const { queueProposal, getProposalState } = require('../../helpers/gov')

async function main({ proposal, proposalId }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337
  if (!isDev) {
    // eslint-disable-next-line no-console
    console.log('GOV QUEUE > Dev mode ON.')
  }

  if (!proposalId) {
    throw new Error('GOV QUEUE > Missing proposal ID.')
  }

  // contract instance
  const { address, abi } = getDeployment(chainId, 'UnlockProtocolGovernor')
  const gov = await ethers.getContractAt(abi, address)

  // close voting period
  if (isDev) {
    const deadline = await gov.proposalDeadline(proposalId)
    const currentBlock = await ethers.provider.getBlockNumber()
    if (currentBlock < deadline) {
      await time.advanceBlockTo(deadline.toNumber())
      // eslint-disable-next-line no-console
      console.log(
        `GOV EXEC > closing voting period (advancing to block #${deadline.toNumber()}`
      )
    }
  }

  // queue proposal
  const state = await getProposalState(proposalId)

  if (state === 'Succeeded') {
    const tx = await queueProposal({ proposal, proposalId })
    const { events, transactionHash } = await tx.wait()
    console.log(events)
    const evt = events.find((v) => v.event === 'ProposalQueued')
    const { eta } = evt.args
    // eslint-disable-next-line no-console
    console.log(
      `Proposal queued: ETA :${eta.toNumber()} (tx: ${transactionHash})`
    )
  } else if (state === 'Queued') {
    const eta = await gov.proposalEta(proposalId)
    // eslint-disable-next-line no-console
    console.log(
      `GOV QUEUE > Proposal is already queued for execution. ETA :${eta.toNumber()}`
    )
  } else {
    throw new Error(
      `GOV QUEUE > Proposal state (${state}) does not allow queue.`
    )
  }
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
