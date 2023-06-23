const { ethers } = require('hardhat')
const { submitProposal } = require('../../helpers/gov')
const { impersonate } = require('../../test/helpers')

async function main({ proposal, proposerAddress, govAddress }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337

  // log what is happening
  console.log(
    `GOV SUBMIT > Proposed (${proposal.calls.length} calls):\n${proposal.calls
      .map(
        ({ contractName, functionName, functionArgs }) =>
          `- ${contractName} ${functionName} ${functionArgs}`
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

  const { events, transactionHash } = await proposalTx.wait()
  const evt = events.find((v) => v.event === 'ProposalCreated')

  // check for failure
  if (!evt) {
    throw new Error('GOV SUBMIT > Proposal not created.')
  }

  // success
  const { proposalId } = evt.args
  const currentBlock = await ethers.provider.getBlockNumber()

  console.log(
    `GOV SUBMIT > proposal submitted: ${await proposalId.toString()} (txid: ${transactionHash}, block: ${currentBlock})`
  )
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
