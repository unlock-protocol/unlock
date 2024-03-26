const { ethers, ZeroAddress } = require('ethers')
const { parseSafeMulticall } = require('../helpers/multisig')

module.exports = async () => {
  const calls = [
    {
      contractAddress: ZeroAddress,
      value: ethers.parseEther('0.0001'),
    },
    {
      contractAddress: ZeroAddress,
      value: ethers.parseEther('0.0001'),
    },
  ]

  // parse calls for Safe
  const packedData = await parseSafeMulticall(calls)
  console.log(packedData)
  return {
    proposalName: 'Test a multicall',
    calls: { calldata: packedData },
  }
}
