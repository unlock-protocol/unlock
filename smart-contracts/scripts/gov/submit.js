const { ethers } = require('hardhat')
const {
  parseProposal,
  encodeProposalArgs,
  decodeProposalArgs,
  submitProposal,
} = require('../../helpers/gov')
const { impersonate } = require('../../test/helpers')

async function main({
  proposerAddress,
  contractAddress,
  contractName,
  functionName,
  functionArgs,
  proposalName,
  proposalId: _proposalId,
  calldata,
  govAddress,
}) {
  if (_proposalId) {
    // eslint-disable-next-line no-console
    console.log('GOV SUBMIT > proposalId is present, skipping submit task')
    return
  }
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337

  let proposal
  if (!functionName) {
    throw new Error('GOV SUBMIT > Missing function name.')
  }
  if (!contractName) {
    throw new Error('GOV SUBMIT > Missing function name.')
  }
  if (!proposalName) {
    throw new Error('GOV SUBMIT > Missing proposal name.')
  }

  if (!calldata) {
    calldata = await encodeProposalArgs({
      contractName,
      functionName,
      functionArgs,
    })
  } else {
    // parse to log
    functionArgs = await decodeProposalArgs({
      contractName,
      functionName,
      calldata,
    })
  }

  // parse proposal correctly
  proposal = await parseProposal({
    contractName,
    calldata,
    proposalName,
    contractAddress,
  })

  // eslint-disable-next-line no-console
  console.log(
    `GOV SUBMIT > Proposing: ${contractName} ${functionName} ${functionArgs}`
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
  // eslint-disable-next-line no-console
  console.log(
    `GOV SUBMIT > proposal submitted: ${await proposalId.toString()} (txid: ${transactionHash})`
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
