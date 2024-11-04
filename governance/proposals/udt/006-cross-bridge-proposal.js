/**
 * Example of a bridged proposal that will be sent across Connext to multisigs
 * on the other side of the network.
 */
const { ADDRESS_ZERO, getUnlock } = require('@unlock-protocol/hardhat-helpers')
const { IConnext, targetChains } = require('../../helpers/bridge')
const { ethers } = require('ethers')
const { networks } = require('@unlock-protocol/networks')

module.exports = async () => {
  // parse call data for function call
  const { interface: unlockInterface } = await getUnlock()
  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  const burnAddress = ADDRESS_ZERO
  const tokenAmount =
    ethers.parseEther(`0.000001`) + BigInt(`${randInt(1, 999)}`)

  const calldata = unlockInterface.encodeFunctionData('transferTokens', [
    ADDRESS_ZERO, // native tokens
    burnAddress, // to
    tokenAmount,
  ])

  console.log(`action: transferTokens(${tokenAmount})`)

  // src info
  const chainId = 1
  console.log(
    `from mainnet (${chainId}) to chains ${targetChains
      .map(({ id }) => id)
      .join(' - ')}`
  )
  const {
    governanceBridge: { connext: bridgeAddress },
  } = networks[chainId].dao

  // dest info
  const explainers = []
  const parsedCalls = await Promise.all(
    targetChains.map(async (network) => {
      // make sure we have bridge infor in networks package
      if (!network.dao) return {}

      const {
        dao,
        unlockAddress,
        id: destChainId,
        name: destChainName,
      } = network

      const {
        domainId: destDomainId,
        modules: { connextMod: destAddress },
      } = dao.governanceBridge

      if (!destDomainId || !destAddress) {
        throw Error('Missing bridge information')
      }

      // encode instructions to be executed by the SAFE
      const abiCoder = ethers.AbiCoder.defaultAbiCoder()
      const moduleData = abiCoder.encode(
        ['address', 'uint256', 'bytes', 'bool'],
        [
          unlockAddress, // to
          0, // value
          calldata, // data
          0, // operation: 0 for CALL, 1 for DELEGATECALL
        ]
      )
      console.log(moduleData)

      // add a small explanation
      explainers.push([destChainId, destChainName, unlockAddress])

      // proposed changes
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
    })
  )

  // filter out empty calls
  const calls = parsedCalls.filter((call) => Object.keys(call).length !== 0)
  console.log(calls)

  const proposalName = `Testing the new cross-chain governance workflow

This DAO proposal aims at testing the new cross-chain governance process of Unlock Protocol's DAO. This new governance 
protocol allow proposals to propagate directly from the main DAO contract to protocol contracts on other chains.

# How it works

To reach another chain, all calls go though the [Connext bridge](https://www.connext.network/) and are 
executed on the other side of the bridge, after a period of cooldown.

The workflow is as follows

1. A DAO proposal is created, containing 1 call per chain.
2. If the vote succeeds, the DAO proposal is executed. All calls are sent to the bridge.
3. Each call crosses the bridge seperately towards its destination on a specific chain.
4. The call is received on the destination chain by the Unlock multisig.
5. Once received, the call is held in the multisig for a period of X days, during which it can be cancelled.
6. Once the cooldown period ends, the call is executed.

NB: The cooldown period is useful to prevent malicious or errored calls from being executed. 


# This proposal

The goal of this proposal is to test this new cross-chain workflow. Here, we are sending instructions
from this DAO to the Unlock core contract on other chains. This is a common case used in protocol upgrades
or protocol settings changes.

Here we don't do anything out of the ordinary, just a simple transfer of native tokens on each chain to the zero 
address. By burning a small amount of tokens, we just aim at proving that the process is sound 
and actually works in practice.

# The calls

All calls are sent to the Connext bridge at ${bridgeAddress} on chain ${chainId}:

${explainers
  .map(
    ([destChainId, destChainName, destAddress]) =>
      `- \`transferTokens(${tokenAmount})\` from ${destAddress} on chain ${destChainName} (${destChainId})`
  )
  .join('\n')}


Onwards !

The Unlock Protocol Team
`
  console.log(proposalName)
  // send to multisig / DAO
  return {
    proposalName,
    calls,
  }
}
