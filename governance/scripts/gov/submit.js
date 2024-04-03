const { ethers } = require('hardhat')
const { submitProposal } = require('../../helpers/gov')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

async function main({ proposal, govAddress }) {
  // log what is happening
  console.log(
    `GOV SUBMIT > Proposed (${proposal.calls.length} calls):\n${proposal.calls
      .map(
        ({ contractNameOrAbi, functionName, functionArgs }) =>
          `- ${contractNameOrAbi} ${functionName} ${functionArgs}`
      )
      .join('\n')}\n`
  )

  // submit the proposal
  const proposalTx = await submitProposal({
    proposal,
    govAddress,
  })
  const receipt = await proposalTx.wait()
  const { event, hash } = await getEvent(receipt, 'ProposalCreated')

  // check for failure
  if (!event) {
    throw new Error('GOV SUBMIT > Proposal not created.')
  }

  // success
  const { proposalId } = event.args
  const currentBlock = await ethers.provider.getBlockNumber()

  console.log(
    `GOV SUBMIT > proposal submitted: ${await proposalId.toString()} (txid: ${hash}, block: ${currentBlock})`
  )

  return { proposalId, hash }
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
