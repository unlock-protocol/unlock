const { ethers } = require('hardhat')
const {
  parseProposal,
  encodeProposalArgs,
  decodeProposalArgs,
  submitProposal,
} = require('../../helpers/gov')
const { impersonate } = require('../../test/helpers/mainnet')

async function main({
  proposerAddress,
  contractName,
  contractAddress,
  contractAbi,
  functionName,
  functionArgs,
  proposalName,
  proposalId: _proposalId,
  calldata,
}) {
  if (_proposalId) {
    // eslint-disable-next-line no-console
    console.log('GOV SUBMIT > proposalId is present, skipping submit task')
    return
  }
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337

  if (!functionName) {
    // eslint-disable-next-line no-console
    throw new Error('GOV SUBMIT > Missing function name.')
  }
  if (!contractName && !contractAbi) {
    // eslint-disable-next-line no-console
    throw new Error('GOV SUBMIT > Missing contract name or ABI.')
  }
  if (!proposerAddress) {
    // eslint-disable-next-line no-console
    throw new Error('GOV SUBMIT > Missing proposer address.')
  }
  if (!proposalName) {
    // eslint-disable-next-line no-console
    throw new Error('GOV SUBMIT > Missing proposal name.')
  }

  if (!calldata) {
    calldata = await encodeProposalArgs({
      contractName,
      functionName,
      functionArgs,
      contractAbi,
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
  const proposal = await parseProposal({
    contractName,
    contractAddress,
    contractAbi,
    calldata,
    proposalName,
  })

  // eslint-disable-next-line no-console
  console.log(
    `GOV SUBMIT > Proposed "${proposalName}" : ${functionName}(${functionArgs})`
  )

  // submit the proposal
  if (isDev || process.env.RUN_MAINNET_FORK) {
    // eslint-disable-next-line no-console
    console.log('GOV SUBMIT (dev) > Impersonate proposer ')
    await impersonate(proposerAddress)
  }
  // eslint-disable-next-line no-console
  console.log(`GOV SUBMIT > Proposer: ${proposerAddress}`)
  const proposalTx = await submitProposal({ proposerAddress, proposal })

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

  // eslint-disable-next-line consistent-return
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
