const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')
const { GovernorUnlockProtocol } = require('@unlock-protocol/contracts')
const { fetchDataFromTx } = require('./tx')

/**
 * Helper to parse a DAO proposal from an object
 * @param {String} proposalName name of the proposal
 * @param {Array.<{
 * contractAddress: string, // target address of the call
 * calldata: string, // if not present, will be encoded using functionName + functionArgs
 * contractNameOrAbi: string, // to fetch the encoding ABI
 * functionName: string,
 * functionArgs: Array,
 * }>} calls An array of calls to be send to the proposal
 * @returns a formatted proposal in the form of an array of 3 arrays and a string
 * ex. [ [ to (address) ], [ value (in ETH) ], [ calldata (as string) ],  "name of the proposal"]
 */
const parseProposal = async ({
  calls, // should be an array. If present will bypass functionName / functionArgs logic
  proposalName,
  txId,
  govAddress = ADDRESS_ZERO,
}) => {
  let proposal
  const gov = await getGovContract(govAddress)
  if (calls && proposalName) {
    proposal = await parseProposalFromFile({
      calls,
      proposalName,
    })
  } else {
    proposal = await getProposalArgsFromTx({ txId, gov })
  }
  return { ...proposal, gov }
}

const parseProposalFromFile = async ({
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
        contractNameOrAbi,
        contractAddress,
        functionName,
        functionArgs,
        value = 0,
      }) => {
        if (!calldata) {
          calldata = await encodeProposalArgs({
            contractNameOrAbi,
            functionName,
            functionArgs,
          })
        }
        return { calldata, contractAddress, value }
      }
    )
  )

  const { targets, values, calldatas } = encodedCalls.reduce(
    ({ targets, values, calldatas }, { calldata, contractAddress, value }) => ({
      targets: [...targets, contractAddress], // contracts to send the proposal to
      values: [...values, value], // value in ETH, default to 0
      calldatas: [...calldatas, calldata], // encoded func calls
    }),
    {
      targets: [],
      values: [],
      calldatas: [],
    }
  )
  const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(proposalName))
  return {
    targets,
    values,
    calldatas,
    descriptionHash,
    description: proposalName,
  }
}

const getProposalArgsFromTx = async ({ gov, txId }) => {
  const [proposalId, , _targets, _values, , _calldatas, , , description] =
    await fetchDataFromTx({
      txHash: txId,
      eventName: 'ProposalCreated',
      abi: GovernorUnlockProtocol.abi,
    })
  // make sure values are correct
  const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(description))
  const targets = _targets.toArray()
  const values = _values.toArray()
  const calldatas = _calldatas.toArray()
  const proposalIdFromFetchedValues = await gov.hashProposal(
    targets,
    values,
    calldatas,
    descriptionHash
  )
  if (proposalIdFromFetchedValues !== proposalId) {
    throw new Error('proposalId mismatch')
  }
  return {
    targets,
    values,
    calldatas,
    descriptionHash,
  }
}

/**
 * HELPERS
 */
const getProposalId = async (proposal) => {
  const { targets, values, calldatas, descriptionHash } = await parseProposal({
    ...proposal,
  })

  // solidityKeccak256
  const encoder = ethers.AbiCoder.defaultAbiCoder()
  const proposalId = BigInt(
    ethers.keccak256(
      encoder.encode(
        ['address[]', 'uint256[]', 'bytes[]', 'bytes32'],
        [targets, values, calldatas, descriptionHash]
      )
    )
  )

  return proposalId
}

const validateProposalCall = (call) => {
  // proposal contains a single contract call
  if (!call.calldata && !call.functionArgs) {
    throw new Error('Missing calldata or function args.')
  }
  if (!call.contractAddress) {
    throw new Error('Missing target (to) in proposal call.')
  }
}

const encodeProposalArgs = async ({
  contractNameOrAbi,
  functionName,
  functionArgs,
}) => {
  // use that pattern instead of `getContractFactory` so we support passing interfaces
  const { interface: contractInterface } = await ethers.getContractAt(
    contractNameOrAbi,
    ADDRESS_ZERO
  )

  const calldata = contractInterface.encodeFunctionData(functionName, [
    ...functionArgs,
  ])
  return calldata
}

const decodeProposalArgs = async ({
  contractNameOrAbi,
  functionName,
  calldata,
}) => {
  const { interface: contractInterface } = await ethers.getContractAt(
    contractNameOrAbi,
    ADDRESS_ZERO
  )
  const decoded = contractInterface.decodeFunctionData(functionName, calldata)
  return decoded
}

const getProposalIdFromContract = async ({ proposal, govAddress, txId }) => {
  const { targets, values, calldatas, descriptionHash } = await parseProposal({
    ...proposal,
    govAddress,
    txId,
  })

  const gov = await getGovContract(govAddress)
  const proposalId = await gov.hashProposal(
    targets,
    values,
    calldatas,
    descriptionHash
  )

  return proposalId
}

const queueProposal = async ({ proposal, govAddress, proposalId, txId }) => {
  const { targets, values, calldatas, descriptionHash, gov } =
    await parseProposal({
      ...proposal,
      govAddress,
      txId,
    })
  return await gov.queue(targets, values, calldatas, descriptionHash)
}

const executeProposal = async ({ proposal, govAddress, proposalId, txId }) => {
  const { gov, targets, values, calldatas, descriptionHash } =
    await parseProposal({
      ...proposal,
      proposalId,
      govAddress,
      txId,
    })
  return await gov.execute(targets, values, calldatas, descriptionHash)
}

/**
 * Submits a proposal
 */
const submitProposal = async ({ proposal, govAddress, proposalId, txId }) => {
  const gov = await getGovContract(govAddress)
  const { targets, values, calldatas, description } = await parseProposal({
    ...proposal,
    govAddress,
    proposalId,
    txId,
  })
  return await gov.propose(targets, values, calldatas, description)
}

const getGovContract = async (govAddress) => {
  const gov = await ethers.getContractAt(GovernorUnlockProtocol.abi, govAddress)
  return gov
}

const getProposalVotes = async (proposalId, govAddress) => {
  const gov = await getGovContract(govAddress)
  const votes = await gov.proposalVotes(proposalId)
  return votes
}

const getQuorum = async (govAddress) => {
  const gov = await getGovContract(govAddress)

  const currentBlock = await ethers.provider.getBlockNumber()
  return await gov.quorum(currentBlock - 1)
}

const getGovTokenAddress = async (govAddress) => {
  const gov = await getGovContract(govAddress)
  return await gov.token()
}

const getTimelockAddress = async (govAddress) => {
  const gov = await getGovContract(govAddress)
  return await gov.timelock()
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

  const gov = await getGovContract(govAddress)
  const state = await gov.state(proposalId)
  return states[state]
}

const loadProposal = async (proposalPath, params = []) => {
  const prop = require(proposalPath)
  if (typeof prop === 'function') {
    return await prop(params)
  } else {
    return prop
  }
}

const etaToDate = (eta) => new Date(parseInt(eta.toString()) * 1000)

const isAlreadyPast = (eta) => new Date(parseInt(eta.toString())) > Date.now()

module.exports = {
  loadProposal,
  getProposalVotes,
  getQuorum,
  getGovContract,
  getGovTokenAddress,
  getTimelockAddress,
  getProposalState,
  getProposalId,
  getProposalIdFromContract,
  parseProposal,
  encodeProposalArgs,
  decodeProposalArgs,
  submitProposal,
  queueProposal,
  executeProposal,
  etaToDate,
  isAlreadyPast,
  getProposalArgsFromTx,
}
