/**
 * This proposal send calls accross the bridge to enable token distribution
 * on all supported networks.
 */
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { IConnext, targetChains } = require('../helpers/bridge')
const { parseSafeMulticall } = require('../helpers/multisig')

const { ethers } = require('hardhat')

const parseSetOracleCalls = async (destChainId) => {
  const {
    unlockAddress,
    governanceBridge,
    // name: destChainName,
    tokens,
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
  // TODO: set all tokens in networks packages
  // TODO: check if uniswap oracle pool exists with correct fee
  const calls = tokens.map((token) =>
    unlockInterface.encodeFunctionData('setOracle', [
      token.address,
      oracleAddress,
    ])
  )
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
    ({ unlockDaoToken }) => !!unlockDaoToken
  )

  // 2. set oracle for UDT in Unlock on dest chains
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
