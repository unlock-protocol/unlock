const { ethers } = require('hardhat')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')
const l1BridgeAbi = require('../helpers/abi/l1standardbridge.json')

// TODO: change to mainnet / base
const srcChainId = 11155111 // 1
const destChainId = 84532 // 8453

// bridge address
const standardBridges = {
  1: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
  11155111: '0xfd0Bf71F60660E2f608ed56e1659C450eB113120',
}

// sepolia gov : 0x84AaD43734930bf179B79d724904A6b6Fc14C72d
const timelocks = {
  1: '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B',
  8453: '0xB34567C4cA697b39F72e1a8478f285329A98ed1b',
  84532: '0x246A13358Fb27523642D86367a51C2aEB137Ac6C', // hehe
  11155111: '0x3C0c44EeCd29c7354F1b676BD73E8c414B8439B1',
}

const defaultGasAmount = '200000'

module.exports = async ({
  mainnetTimelockAddress = timelocks[srcChainId],
  baseTimelockAddress = timelocks[destChainId],
  bridgeAddress = standardBridges[srcChainId],
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
  console.log({
    udtMainnetAddress,
    udtBaseAddress,
  })

  // get current UDT balance
  const udt = await getERC20Contract(udtMainnetAddress)
  const mainnetUDTBalance = await udt.balanceOf(mainnetTimelockAddress)

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
    // call to bridge udt
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
  const proposalName = `# Transfer UDT to base

This proposal will bridge all existing UDT to Base and transfer them to the new UP Governor.
`

  return {
    proposalName,
    calls,
  }
}
