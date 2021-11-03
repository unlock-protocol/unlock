const ethers = require('ethers')

const encodeProposalFunc = ({ interface, functionName, data }) => {
  const calldata = interface.encodeFunctionData(functionName, [...data])
  return calldata
}

const parseProposal = async ({
  address,
  abi,
  functionName,
  data,
  proposalName,
  value = 0, // value in ETH, default to 0
}) => {
  // get instance
  const { interface } = await new ethers.Contract(address, abi)

  // parse function data
  const calldata = encodeProposalFunc({ interface, functionName, data })

  return [
    [address], // contract to send the proposal to
    [value],
    [calldata],
    proposalName,
  ]
}

module.exports = {
  encodeProposalFunc,
  parseProposal,
}
