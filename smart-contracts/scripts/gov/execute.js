const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const {
  getProposalState,
  executeProposal,
  getProposalId,
} = require('../../helpers/gov')

async function main({ proposal, govAddress }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337 || process.env.RUN_FORK

  if (!proposal) {
    throw new Error('GOV EXEC > Missing proposal.')
  }
  console.log(proposal)
  const proposalId = proposal.proposalId || (await getProposalId(proposal))

  // contract instance etc
  let state = await getProposalState(proposalId, govAddress)
  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)

  if (state === 'Queued') {
    // check if time is ripe
    const eta = await gov.proposalEta(proposalId)
    if (!isDev) {
      if (eta.toNumber() * 1000 > Date.now()) {
        console.log(
          `GOV EXEC > Proposal still queued until: ${new Date(
            eta.toNumber() * 1000
          )}`
        )
        return
      }
    } else {
      const currentTime = (await time.latest()).toNumber()
      console.log(
        `GOV EXEC > : increasing currentTime ${new Date(
          currentTime * 1000
        )} to eta ${new Date(eta * 1000)}`
      )
      if (currentTime < eta) {
        await time.increaseTo(eta + 1)
      }
      state = await getProposalState(proposalId, govAddress)
    }

    // execute the tx
    const tx = await executeProposal({ proposal, govAddress })
    const { events, transactionHash } = await tx.wait()
    const evt = events.find((v) => v.event === 'ProposalExecuted')
    if (evt) {
      // eslint-disable-next-line no-console
      console.log(
        `GOV EXEC > Proposal executed successfully (txid: ${transactionHash})`
      )
    }
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
