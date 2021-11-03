const { ethers } = require('hardhat')
const { getDeployment } = require('./deployments')

const encodeProposalFunc = ({ interface, functionName, functionArgs }) => {
  const calldata = interface.encodeFunctionData(functionName, [...functionArgs])
  return calldata
}

/**
 * Submits a proposal
 */
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
}
