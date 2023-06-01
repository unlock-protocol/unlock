const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('../test/helpers')

/**
 * Helper to parse a DAO proposal from an object
 * @param {Array.<{
 * contractAddress: string, // target address of the call
 * calldata: string, // if not present, will be encoded using functionName + functionArgs
 * contractName: string, // to fetch the encoding ABI
 * functionName: string,
 * functionArgs: Array,
 * }>} calls An array of calls to be send to the proposal
 * @returns a formatted proposal in the form of an array of 3 arrays and a string
 * ex. [ [ to (address) ], [ value (in ETH) ], [ calldata (as string) ],  "name of the proposal"]
 */

const parseProposal = async ({
  calls, // should be an array. If present will bypass functionName / functionArgs logic
  proposalName,
}) => {
  // parse an array of contract calls
  if (!calls || !calls.length) {
    throw new Error('Missing contract calls.')
  }

  // make sure needed data is there
  calls.forEach(validateProposalCall)

  // assume similar values for all calls
  const encodedCalls = await Promise.all(
    calls.map(
      async ({
        calldata,
        contractName,
        contractAddress,
        functionName,
        functionArgs,
      }) => {
        if (!calldata) {
          calldata = await encodeProposalArgs({
            contractName,
            functionName,
            functionArgs,
          })
        }
        return { calldata, contractAddress, value: 0 }
      }
    )
  )

  const parsed = encodedCalls.reduce(
    (arr, { calldata, contractAddress, value }) => {
      return !arr.length
        ? [[contractAddress], [value], [calldata]]
        : [
            [...arr[0], contractAddress], // contracts to send the proposal to
            [...arr[1], value], // value in ETH, default to 0
            [...arr[2], calldata], // encoded func calls
          ]
    },
    []
  )

  return [...parsed, proposalName]
}

const getProposalId = async (proposal) => {
  const [targets, values, calldata, description] = await parseProposal({
    ...proposal,
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
  })

  const [defaultSigner] = await ethers.getSigners()
  const proposerWallet = proposerAddress
    ? defaultSigner
    : await ethers.getSigner(proposerAddress)

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

const validateProposalCall = (proposal) => {
  // proposal contains a single contract call
  if (!proposal.calldata && !proposal.functionArgs) {
    throw new Error('Missing calldata or function args.')
  }
}

const encodeProposalArgs = async ({
  contractName,
  functionName,
  functionArgs,
}) => {
  // use that pattern instead of `getContractFactory` so we support passing interfaces
  const { interface } = await ethers.getContractAt(contractName, ADDRESS_ZERO)
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
  })
  const descriptionHash = web3.utils.keccak256(description)
  const { proposerAddress } = proposal
  let voterWallet
  if (!proposerAddress) {
    ;[voterWallet] = await ethers.getSigners()
  } else {
    voterWallet = await ethers.getSigner(proposerAddress)
  }

  console.log({ targets, values, calldatas, description })

  const gov = await ethers.getContractAt('UnlockProtocolGovernor', govAddress)

  return await gov
    .connect(voterWallet)
    .queue(targets, values, calldatas, descriptionHash)
}

const executeProposal = async ({ proposal, govAddress }) => {
  const { proposerAddress } = proposal
  const [targets, values, calldatas, description] = await parseProposal({
    ...proposal,
  })
  const descriptionHash = web3.utils.keccak256(description)
  let voterWallet
  if (!proposerAddress) {
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
  if (typeof prop === 'function') {
    return await prop()
  } else {
    return prop
  }
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
  submitProposal,
  queueProposal,
  executeProposal,
}
