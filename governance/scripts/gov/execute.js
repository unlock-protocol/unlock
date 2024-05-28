const { ethers, network } = require('hardhat')
const { GovernorUnlockProtocol } = require('@unlock-protocol/contracts')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const {
  getProposalState,
  executeProposal,
  getProposalId,
  etaToDate,
  isAlreadyPast,
} = require('../../helpers/gov')

async function main({ proposal, proposalId, txId, govAddress }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337 || process.env.RUN_FORK

  if (!proposal && !proposalId) {
    throw new Error('GOV EXEC > Missing proposal or proposalId.')
  }
  if (!proposal && proposalId && !txId) {
    throw new Error(
      'GOV EXEC > The tx id of the proposal creation is required to execute the proposal.'
    )
  }

  if (!proposalId) {
    proposalId = proposal.proposalId || (await getProposalId(proposal))
  }

  // contract instance etc
  let state = await getProposalState(proposalId, govAddress)
  const gov = await ethers.getContractAt(GovernorUnlockProtocol.abi, govAddress)

  if (state === 'Queued') {
    // check if time is ripe
    const eta = await gov.proposalEta(proposalId)
    if (!isDev) {
      if (isAlreadyPast(eta)) {
        console.log(`GOV EXEC > Proposal still queued until: ${etaToDate(eta)}`)
        return
      }
    } else {
      const { timestamp: currentTime } =
        await ethers.provider.getBlock('latest')
      console.log(
        `GOV EXEC > : increasing currentTime ${etaToDate(
          currentTime
        )} to eta ${etaToDate(eta)}`
      )
      if (currentTime < eta) {
        await network.provider.request({
          method: 'evm_setNextBlockTimestamp',
          params: [parseInt(eta.toString()) + 1],
        })
      }
      state = await getProposalState(proposalId, govAddress)
    }

    // execute the tx
    const tx = await executeProposal({ proposal, govAddress, txId })
    const receipt = await tx.wait()
    const { event, hash } = await getEvent(receipt, 'ProposalExecuted')
    if (event) {
      // eslint-disable-next-line no-console
      console.log(`GOV EXEC > Proposal executed successfully (txid: ${hash})`)
    }
    return receipt
  } else if (state === 'Executed') {
    console.log('GOV EXEC > Proposal has already been executed')
  } else {
    console.log(
      `GOV VOTE > Proposal state (${state}) does not allow execution.`
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
