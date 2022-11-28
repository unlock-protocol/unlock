const { ethers } = require('hardhat')

const encodeProposalFunc = ({ interface, functionName, functionArgs }) => {
  const calldata = interface.encodeFunctionData(functionName, [...functionArgs])
  return calldata
}

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
  calldata, // if not present, will be encoded using func name + args
  functionName,
  functionArgs,
  proposalName,
  value = 0,
  address,
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
    [address], // contract to send the proposal to
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
  const calldata = encodeProposalFunc({ interface, functionName, functionArgs })
  return calldata
}

const decodeProposalArgs = async ({ contractName, functionName, calldata }) => {
  const { interface } = await ethers.getContractFactory(contractName)
  const decoded = interface.decodeFunctionData(functionName, calldata)
  return decoded
}

const queueProposal = async ({ proposal, govAddress }) => {
  const { proposerAddress } = proposal
  const [targets, values, calldatas, description] = await parseProposal({
    ...proposal,
    address: govAddress,
  })
  const descriptionHash = web3.utils.keccak256(description)
  const voterWallet = await ethers.getSigner(proposerAddress)

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
  const voterWallet = await ethers.getSigner(proposerAddress)

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
  const proposerWallet = await ethers.getSigner(proposerAddress)
  return await gov.connect(proposerWallet).propose(...proposal)
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

module.exports = {
  getProposalVotes,
  getQuorum,
  getProposalState,
  encodeProposalFunc,
  getProposalId,
  getProposalIdFromContract,
  parseProposal,
  encodeProposalArgs,
  decodeProposalArgs,
  submitProposal,
  queueProposal,
  executeProposal,
}
