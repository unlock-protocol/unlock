const { ethers, ZeroAddress } = require('ethers')
const { parseSafeMulticall } = require('../../helpers/multisig')
const { UnlockV12 } = require('@unlock-protocol/contracts')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')

module.exports = async () => {
  const { unlockAddress, tokens, id: chainId } = await getNetwork()
  const { address: USDC } = tokens.find(({ symbol }) => symbol === 'USDC')
  const { interface } = await getERC20Contract(USDC)

  const calls = [
    {
      contractAddress: ZeroAddress,
      value: ethers.parseEther('0.0001'),
    },
    {
      contractAddress: USDC,
      calldata: interface.encodeFunctionData('transfer', [
        ZeroAddress,
        ethers.parseUnits('0.1', 8),
      ]),
    },
    {
      contractNameOrAbi: UnlockV12.abi,
      contractAddress: unlockAddress,
      functionName: 'setProtocolFee',
      functionArgs: '0.0001',
    },
  ]

  // parse calls for Safe
  const packedCalls = await parseSafeMulticall({ chainId, calls })
  return {
    proposalName: 'Test a multicall',
    calls: [packedCalls],
  }
}
