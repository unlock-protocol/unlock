const { ethers } = require('hardhat')

const getProposalId = async (proposal, govAddress) => {
  const [targets, values, calldata, description] = await parseProposal({
    ...proposal,
    address: govAddress,
  })

  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(description)
  )

  // solidityKeccak256
  const proposalId = ethers.BigNumber.from(
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address[]', 'uint256[]', 'bytes[]', 'bytes32'],
        [targets, values, calldata, descriptionHash]
      )
    )
  )

  return proposalId
}

const getProposalIdFromContract = async (proposal, govAddress) => {
  const { proposerAddress } = proposal
  const [to, value, calldata, description] = await parseProposal({
    ...proposal,
    address: govAddress,
  })

  const proposerWallet = await ethers.getSigner(proposerAddress)
  const gov = await ethers.getContractAt(
    'UnlockProtocolGovernor',
    govAddress,
    proposerWallet
  )

  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(description)
  )

  const proposalId = await gov.hashProposal(
    to,
    value,
    calldata,
    descriptionHash
  )

  return proposalId
}

const parseProposal = async ({
  contractName,
  contractAddress,
  calldata, // if not present, will be encoded using func name + args
  functionName,
  functionArgs,
  proposalName,
  value = 0,
}) => {
  if (!calldata && !functionArgs) {
    // eslint-disable-next-line no-console
    throw new Error('Missing calldata or function args.')
  }

  // if no call data, then parse it
  if (!calldata) {
    calldata = await encodeProposalArgs({
      contractName,
      functionName,
      functionArgs,
    })
  }
  return [
    [contractAddress], // contract to send the proposal to
    [value], // value in ETH, default to 0
    [calldata], // encoded func call
    proposalName,
  ]
}

const encodeProposalArgs = async ({
  contractName,
  functionName,
  functionArgs,
}) => {
  const { interface } = await ethers.getContractFactory(contractName)
  const calldata = interface.encodeFunctionData(functionName, [...functionArgs])
  return calldata
}

const decodeProposalArgs = async ({ contractName, functionName, calldata }) => {
  const { interface } = await ethers.getContractFactory(contractName)
  const decoded = interface.decodeFunctionData(functionName, calldata)
  return decoded
}

const queueProposal = async ({ proposal, govAddress }) => {
  const [targets, values, calldatas, description] = await parseProposal({
    ...proposal,
    address: govAddress,
  })
  const descriptionHash = web3.utils.keccak256(description)
  const { proposerAddress } = proposal
  let voterWallet
  if(!proposerAddress) {
    ;[voterWallet] = await ethers.getSigners()
  } else {
    voterWallet = await ethers.getSigner(proposerAddress)
  }

  console.log({targets, values, calldatas, description})

  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)

  return await gov
    .connect(voterWallet)
    .queue(targets, values, calldatas, descriptionHash)
}

const executeProposal = async ({ proposal, govAddress }) => {
  const { proposerAddress } = proposal
  const [targets, values, calldatas, description] = await parseProposal({
    ...proposal,
    address: govAddress,
  })
  const descriptionHash = web3.utils.keccak256(description)
  let voterWallet
  if(!proposerAddress) {
    ;[voterWallet] = await ethers.getSigners()
  } else {
    voterWallet = await ethers.getSigner(proposerAddress)
  }

  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)
  return await gov
    .connect(voterWallet)
    .execute(targets, values, calldatas, descriptionHash)
}

/**
 * Submits a proposal
 */
const submitProposal = async ({ proposerAddress, proposal, govAddress }) => {
  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)
  let proposer
  if (!proposerAddress) {
    ;[proposer] = await ethers.getSigners()
  } else {
    proposer = await ethers.getSigner(proposerAddress)
  }
  return await gov.connect(proposer).propose(...proposal)
}

const getProposalVotes = async (proposalId, govAddress) => {
  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)
  const votes = await gov.proposalVotes(proposalId)
  return votes
}

const getQuorum = async (govAddress) => {
  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)

  const currentBlock = await ethers.provider.getBlockNumber()
  return await gov.quorum(currentBlock - 1)
}

const getProposalState = async (proposalId, govAddress) => {
  const states = [
    'Pending',
    'Active',
    'Canceled',
    'Defeated',
    'Succeeded',
    'Queued',
    'Expired',
    'Executed',
  ]

  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)
  const state = await gov.state(proposalId)
  return states[state]
}

const loadProposal = async (proposalPath) => {
  const prop = require(proposalPath)
  if (typeof prop === 'function' ) {
    return await prop()
  } else {
    return prop
  }
}

/**
 * parseUnlockOwnerCalldata
 * @param {number} action `1` to pass directly the callData to the Unlock contract, 
   * and `2` to trigger a contract upgrade through Unlock's ProxyAdmin
 * @returns calldata
 */
async function parseUnlockOwnerCalldata({ 
  action, 
  functionName,
  functionArgs,
}) {
  
  const contractName = action === 1 ? 'Unlock' : 'ProxyAdmin'
  
  console.log({
    contractName,
    functionName,
    functionArgs
  })
  
  // parse Unlock calldata 
  const { interface } = await ethers.getContractFactory(contractName)
  const actionCallData = interface.encodeFunctionData(
    functionName,
    functionArgs
  )
  // parse _execAction instructions
  const calldata = ethers.utils.defaultAbiCoder.encode([
    'uint8', 
    'bytes'
  ], [
    1, 
    actionCallData
  ])

  return calldata
}

module.exports = {
  loadProposal,
  getProposalVotes,
  getQuorum,
  getProposalState,
  getProposalId,
  getProposalIdFromContract,
  parseProposal,
  encodeProposalArgs,
  decodeProposalArgs,
  parseUnlockOwnerCalldata,
  submitProposal,
  queueProposal,
  executeProposal,
}
