const { ethers } = require('hardhat')
const { submitProposal } = require('../../helpers/gov')
const { impersonate, getEvent } = require('@unlock-protocol/hardhat-helpers')

async function main({ proposal, proposerAddress, govAddress }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337

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
  if (isDev || process.env.RUN_MAINNET_FORK) {
    // eslint-disable-next-line no-console
    console.log('GOV SUBMIT (dev) > Impersonate proposer ')
    await impersonate(proposerAddress)
  }

  const proposalTx = await submitProposal({
    proposerAddress,
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

  return proposalId
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
