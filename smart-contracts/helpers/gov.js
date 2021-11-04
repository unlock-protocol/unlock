const { ethers } = require('hardhat')
const { getDeployment } = require('./deployments')

const encodeProposalFunc = ({ interface, functionName, functionArgs }) => {
  const calldata = interface.encodeFunctionData(functionName, [...functionArgs])
  return calldata
}

const getProposalId = async (proposalFile) => {
  const { proposerAddress } = proposalFile
  const [to, value, calldata, description] = await parseProposal(proposalFile)

  const { chainId } = await ethers.provider.getNetwork()
  const { address, abi } = getDeployment(chainId, 'UnlockProtocolGovernor')

  const proposerWallet = await ethers.getSigner(proposerAddress)
  const gov = new ethers.Contract(address, abi, proposerWallet)

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
  functionName,
  functionArgs,
  proposalName,
  value = 0,
}) => {
  // get contract instance
  const { chainId } = await ethers.provider.getNetwork()
  const { abi, address } = await getDeployment(chainId, contractName)
  const { interface } = new ethers.Contract(address, abi)

  // parse function data
  const calldata = encodeProposalFunc({ interface, functionName, functionArgs })

  return [
    [address], // contract to send the proposal to
    [value], // value in ETH, default to 0
    [calldata], // encoded func call
    proposalName,
  ]
}

/**
 * Submits a proposal
 */
const submitProposal = async ({ proposerAddress, proposal }) => {
  const { chainId } = await ethers.provider.getNetwork()
  const { address, abi } = getDeployment(chainId, 'UnlockProtocolGovernor')
  const proposerWallet = await ethers.getSigner(proposerAddress)
  const gov = new ethers.Contract(address, abi, proposerWallet)
  return await gov.propose(...proposal)
}

module.exports = {
  encodeProposalFunc,
  parseProposal,
  submitProposal,
  getProposalId,
}
