const { ethers } = require('hardhat')
const {
  getNetwork,
  getERC20Contract,
  getBalance,
} = require('@unlock-protocol/hardhat-helpers')
const l1BridgeAbi = require('../../helpers/abi/l1standardbridge.json')

const {
  abi: IWETH,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/weth.json')

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
    tokens,
    nativeCurrency: { wrapped: WETH },
  } = await getNetwork(srcChainId)
  const { address: usdcAddress } = tokens.find(
    ({ symbol }) => symbol === 'USDC'
  )
  // console.log({ usdcAddress })

  const { name: destName, tokens: destTokens } = await getNetwork(destChainId)
  const { address: destUsdcAddress } = destTokens.find(
    ({ symbol }) => symbol === 'USDC'
  )
  console.log(
    `Submitting proposal to send WETH/USDC from ${srcName} to  ${destName} (${srcChainId} > ${destChainId})`
  )

  // get current USDC balance
  const usdc = await getERC20Contract(usdcAddress)
  const mainnetUSDCBalance = await usdc.balanceOf(mainnetTimelockAddress)

  // get mainnet WETH balance
  const weth = await ethers.getContractAt(IWETH, WETH)
  const mainnetWETHBalance = await getBalance(mainnetTimelockAddress, WETH)

  // get base bridge contract
  const bridgeContract = new ethers.Contract(bridgeAddress, l1BridgeAbi)

  const calls = [
    // withdraw all WETH into ETH
    {
      contractAddress: WETH,
      calldata: weth.interface.encodeFunctionData('withdraw', [
        mainnetWETHBalance,
      ]),
    },
    // send ETH through the bridge
    {
      contractAddress: bridgeAddress,
      calldata: bridgeContract.interface.encodeFunctionData('bridgeETHTo', [
        baseTimelockAddress, // _to
        defaultGasAmount, // _minGasLimit,
        '0x', // _extraData
      ]),
      value: mainnetWETHBalance,
    },
    // set allowance for the bridge to spend usdc
    {
      contractAddress: usdcAddress,
      calldata: usdc.interface.encodeFunctionData('approve', [
        bridgeAddress, // dest
        mainnetUSDCBalance, // amount
      ]),
    },
    // call to bridge USDC
    {
      contractAddress: bridgeAddress,
      calldata: bridgeContract.interface.encodeFunctionData('bridgeERC20To', [
        usdcAddress, // _localToken,
        destUsdcAddress, // _remoteToken,
        baseTimelockAddress, // _to
        mainnetUSDCBalance, // amount,
        defaultGasAmount, // _minGasLimit,
        '0x', // _extraData
      ]),
    },
  ]

  // parse calls for Safe
  const proposalName = `# Transfer USDC and ETH to Base

This proposal will bridge the USDC and Wrapped ETH owned by the DAO to Base and transfer them to the new UP Governor. In the process, the WETH will be unwrapped and send as native tokens.
`

  return {
    proposalName,
    calls,
  }
}
