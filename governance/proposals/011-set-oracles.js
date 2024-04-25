/**
 * This proposal send calls accross the bridge to enable token distribution
 * on all supported networks.
 */
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { IConnext, targetChains } = require('../helpers/bridge')
const { parseSafeMulticall } = require('../helpers/multisig')
const getOracles = require('../scripts/uniswap/checkOracles')
const getOracle = require('../scripts/uniswap/oracle')
const { ethers } = require('hardhat')

const parseSetOracleCalls = async (destChainId) => {
  const {
    unlockDaoToken: { address: udtAddress },
    uniswapV3: { oracle: oracleAddress },
  } = await getNetwork(destChainId)

  // get Unlock interface
  const { interface: unlockInterface } = await ethers.getContractAt(
    'Unlock',
    ADDRESS_ZERO
  )

  // get oracles for all tokens
  const tokenOracles = await getOracles({ chainId: destChainId })

  // make sure UDT oracle works
  const rateUdtOracle = await getOracle({
    chainId: destChainId,
    tokenIn: udtAddress,
    fee: 500,
  })
  if (rateUdtOracle === 0n) {
    throw new Error(`UDT pool failing`)
  }

  // parse unlock calls
  const calls = tokenOracles.map(({ token }) =>
    unlockInterface.encodeFunctionData('setOracle', [
      token.address,
      oracleAddress,
    ])
  )
}

const parseBridgeCall = async ({ destChainId, calls }) => {
  const { governanceBridge, unlockAddress } = await getNetwork(destChainId)
  const calldata = await parseSafeMulticall({ chainId: destChainId, calls })

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
  const destChains = targetChains.filter(
    ({ unlockDaoToken, uniswapV3 }) => !!unlockDaoToken && !!uniswapV3.oracle
  )

  console.log(destChains)

  // get oracle for all tokens in Unlock on dest chains
  const setOracleCalls = await Promise.all(
    destChains.map(({ id }) => parseSetOracleCalls(id))
  )

  const proposalName = `Set Uniswap oracles for UDT and most used ERC20 tokens on ${destChains
    .map(({ name }) => name)
    .toString()}

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
    calls: setOracleCalls,
  }
}
