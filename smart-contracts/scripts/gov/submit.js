const { ethers } = require('hardhat')
const { parseProposal, submitProposal } = require('../../helpers/gov')
const { impersonate } = require('../helpers/mainnet')

async function main({
  proposerAddress,
  contractName,
  functionName,
  functionArgs,
  proposalName,
}) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337
  // eslint-disable-next-line no-console
  if (isDev) console.log('Dev mode ON')

  if (!proposerAddress) {
    // eslint-disable-next-line no-console
    throw new Error('GOV PROPOSAL > Missing proposer address.')
  }
  if (!functionName) {
    // eslint-disable-next-line no-console
    throw new Error('GOV PROPOSAL > Missing function name.')
  }
  if (!functionArgs) {
    // eslint-disable-next-line no-console
    throw new Error('GOV PROPOSAL > Missing function args.')
  }
  if (!proposalName) {
    // eslint-disable-next-line no-console
    throw new Error('GOV PROPOSAL > Missing proposal name.')
  }

  const proposal = await parseProposal({
    contractName,
    functionName,
    functionArgs,
    proposalName,
  })

  // submit the proposal
  if (isDev) {
    await impersonate(proposerAddress)
  }
  const proposalTx = await submitProposal({ proposerAddress, proposal })

  // check for failure
  const { events } = await proposalTx.wait()
  const evt = events.find((v) => v.event === 'ProposalCreated')
  const { proposalId } = evt.args

  // eslint-disable-next-line no-console
  console.log('proposal submitted', proposalId)
  return proposalId
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
