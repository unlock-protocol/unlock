const { ethers } = require('hardhat')
const { mineUpTo } = require('@nomicfoundation/hardhat-network-helpers')

const {
  queueProposal,
  getProposalState,
  getProposalVotes,
  getProposalId,
  etaToDate,
} = require('../../helpers/gov')

const { GovernorUnlockProtocol } = require('@unlock-protocol/contracts')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

async function main({ proposalId, txId, proposal, govAddress }) {
  if (!proposal && !proposalId) {
    throw new Error('GOV QUEUE > Missing proposal or proposalId.')
  }
  if (!proposal && proposalId && !txId) {
    throw new Error(
      'GOV QUEUE > The tx id of the proposal creation is required to execute the proposal.'
    )
  }

  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337 || process.env.RUN_FORK
  if (!proposalId) {
    proposalId = proposal.proposalId || (await getProposalId(proposal))
  }

  if (!proposalId) {
    throw new Error('GOV QUEUE > Missing proposal ID.')
  }

  // contract instance
  const gov = await ethers.getContractAt(GovernorUnlockProtocol.abi, govAddress)
  let state = await getProposalState(proposalId, govAddress)

  // close voting period
  if (isDev && state === 'Active') {
    const deadline = await gov.proposalDeadline(proposalId)
    const currentBlock = await ethers.provider.getBlockNumber()
    if (currentBlock < deadline) {
      console.log(
        `GOV QUEUE > closing voting period (advancing to block ${deadline})`
      )
      await mineUpTo(deadline + BigInt(1))
      state = await getProposalState(proposalId, govAddress)
    }
  }

  const votes = await getProposalVotes(proposalId, govAddress)
  console.log(
    `GOV QUEUE > Current proposal ${state} - votes (against, for, abstain): ${votes}`
  )

  // queue proposal
  if (state === 'Succeeded') {
    const tx = await queueProposal({ proposal, govAddress, txId, proposalId })
    const receipt = await tx.wait()
    const { event, hash } = await getEvent(receipt, 'ProposalQueued')
    const { eta } = event.args
    console.log(
      `GOV QUEUE > Proposal queued. ETA :${etaToDate(eta)} (tx: ${hash})`
    )
  } else if (state === 'Queued') {
    const eta = await gov.proposalEta(proposalId)
    console.log(
      `GOV QUEUE > Proposal is queued for execution. ETA :${etaToDate(eta)}`
    )
  } else if (state === 'Active') {
    const deadline = await gov.proposalDeadline(proposalId)
    const currentBlock = await ethers.provider.getBlockNumber()
    console.log(
      `GOV QUEUE > Vote still open until block ${deadline} (current: ${currentBlock})`
    )
  } else {
    console.log(`GOV QUEUE > Proposal state (${state}) does not allow queue.`)
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
