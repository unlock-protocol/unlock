const { ethers } = require('hardhat')
const {
  getNetwork,
  getERC20Contract,
  getBalance,
} = require('@unlock-protocol/hardhat-helpers')
const l1BridgeAbi = require('../../helpers/abi/l1standardbridge.json')

// chains
const srcChainId = 1 // mainnet
const destChainId = 8453 // base
const defaultGasAmount = '200000'

module.exports = async ({
  mainnetTimelockAddress = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B',
  baseTimelockAddress = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b',
  bridgeAddress = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
} = {}) => {
  const {
    name: srcName,
    unlockDaoToken: { address: udtMainnetAddress },
  } = await getNetwork(srcChainId)
  const {
    name: destName,
    unlockDaoToken: { address: udtBaseAddress },
  } = await getNetwork(destChainId)
  console.log(
    `Submitting proposal to bridge UDT from ${srcName} to  ${destName} (${srcChainId} > ${destChainId})`
  )

  // get current UDT balance
  const udt = await getERC20Contract(udtMainnetAddress)
  const mainnetUDTBalance = await udt.balanceOf(mainnetTimelockAddress)

  // get mainnet ETH balance
  const mainnetETHBalance = await getBalance(mainnetTimelockAddress)

  // get base bridge contract
  const bridgeContract = new ethers.Contract(bridgeAddress, l1BridgeAbi)

  const calls = [
    // set allowance for the bridge to spend udt
    {
      contractAddress: udtMainnetAddress,
      calldata: udt.interface.encodeFunctionData('approve', [
        bridgeAddress, // dest
        mainnetUDTBalance, // amount
      ]),
    },
    // call to bridge ETH
    {
      contractAddress: bridgeAddress,
      calldata: bridgeContract.interface.encodeFunctionData('bridgeETHTo', [
        baseTimelockAddress, // _to
        defaultGasAmount, // _minGasLimit,
        '0x', // _extraData
      ]),
      value: mainnetETHBalance,
    },
    // call to bridge UDT
    {
      contractAddress: bridgeAddress,
      calldata: bridgeContract.interface.encodeFunctionData('bridgeERC20To', [
        udtMainnetAddress, // _localToken,
        udtBaseAddress, // _remoteToken,
        baseTimelockAddress, // _to
        mainnetUDTBalance, // amount,
        defaultGasAmount, // _minGasLimit,
        '0x', // _extraData
      ]),
    },
  ]

  // parse calls for Safe
  const proposalName = `# Transfer UDT and ETH to Base

This proposal will bridge the UDT and native ETH owned by the DAO to Base and transfer them to the new UP Governor.
`

  return {
    proposalName,
    calls,
  }
}
