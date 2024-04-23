/**
 * This proposal send calls accross the bridge to enable token distribution
 * on all supported networks.
 */
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')
const {
  IConnext,
  targetChains,
  parseSafeMulticall,
} = require('../helpers/bridge')
const { ethers } = require('hardhat')

// TODO: functions for each network to bridge tokens
const opBridgeToken = async () => {}
const polygonBridgeToken = async () => {}
const arbBridgeToken = async () => {}

// send bridged UDT from DAO
const parseFundingCall = async (chainId) => {
  let calls

  // total amount to transfer on each chain
  const udtAmountToTransfer = ethers.parseUnits('0.1', 8)

  if (chainId === 'base' || chainId === 'op') {
    calls = await opBridgeToken
  }
  if (chainId === 'arb') {
    calls = await arbBridgeToken()
  }
  if (chainId === 'polygon') {
    calls = await polygonBridgeToken()
  }

  // execute all as a single safe multicall
  const packedFundingCalls = await parseSafeMulticall({
    chainId,
    calls,
  })

  return packedFundingCalls
}

const parseSetOracleCall = async (destChainId) => {
  const {
    unlockAddress,
    governanceBridge,
    // name: destChainName,
    unlockDaoToken: { address: udtAddress },
    uniswapV3: { oracle: oracleAddress },
  } = await getNetwork(destChainId)

  // make sure we have bridge infor in networks package
  if (!governanceBridge) return {}

  // get Unlock interface
  const { interface: unlockInterface } = await ethers.getContractAt(
    'Unlock',
    ADDRESS_ZERO
  )

  // parse unlock call
  const calldata = unlockInterface.encodeFunctionData('setOracle', [
    udtAddress,
    oracleAddress,
  ])

  // encode instructions to be executed by the SAFE
  const moduleData = await ethers.defaultAbiCoder.encode(
    ['address', 'uint256', 'bytes', 'bool'],
    [
      unlockAddress, // to
      0, // value
      calldata, // data
      1, // operation: 0 for CALL, 1 for DELEGATECALL
      // 0,
    ]
  )

  // get bridge info
  const {
    domainId: destDomainId,
    modules: { connextMod: destAddress },
    connext: bridgeAddress,
  } = governanceBridge

  if (!destDomainId || !destAddress) {
    throw Error('Missing bridge information')
  }

  // parse call for bridge
  return {
    contractAddress: bridgeAddress,
    contractNameOrAbi: IConnext,
    functionName: 'xcall',
    functionArgs: [
      destDomainId,
      destAddress, // destMultisigAddress,
      ADDRESS_ZERO, // asset
      ADDRESS_ZERO, // delegate
      0, // amount
      30, // slippage
      moduleData, // calldata
    ],
  }
}

module.exports = async () => {
  // list networks that are supported by Connext and have UDT bridged
  const destChainIds = targetChains.filter(
    ({ unlockDaoToken }) => !!unlockDaoToken.address
  )

  // 1. send some UDT from DAO to the Unlock contract
  const fundingCalls = await Promise.all(
    destChainIds.map((chainId) => parseFundingCall(chainId))
  )

  // 2. set oracle for UDT in Unlock on dest chains
  const setOracleCalls = await Promise.all(
    destChainIds.map((chainId) => parseSetOracleCall(chainId))
  )

  const proposalName = `Enabling UDT distribution on ${destChainIds.toString()}

This DAO proposal aims at testing the new cross-chain governance process of Unlock Protocol's DAO. This new governance 
protocol allow proposals to propagate directly from the main DAO contract to protocol contracts on other chains.

# How it works

# This proposal

# The calls

Onwards !

The Unlock Protocol Team
`
  console.log(proposalName)

  // send to multisig / DAO
  return {
    proposalName,
    calls: [...fundingCalls, ...setOracleCalls],
  }
}
