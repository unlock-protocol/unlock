const { ethers } = require('hardhat')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { targetChains, ConnextMod } = require('../../helpers/bridge')
const { parseSafeMulticall } = require('../../helpers/multisig')
const { parseBridgeCall } = require('../../helpers/crossChain')

const BASE_TIMELOCK = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'

const getProxyAdminAddress = async (providerURL, contractAddress) => {
  const provider = new ethers.JsonRpcProvider(providerURL)

  const hex = await provider.getStorage(
    contractAddress,
    '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'
  )

  const adminAddress = ethers.stripZerosLeft(hex)
  return adminAddress
}

module.exports = async () => {
  const mainnet = await getNetwork(1)
  const base = await getNetwork(8453)

  // mainnet owmership
  const ownable = new ethers.Interface([
    `function transferOwnership(address newOwner)`,
  ])
  const mainnetCalls = [
    // 1. transfer unlock mainnet to multisig
    {
      contractAddress: mainnet.unlockAddress,
      calldata: ownable.encodeFunctionData('transferOwnership', [
        mainnet.multisig,
      ]),
    },
    // 2. transfer unlock mainnet proxyAdmin to multisig
    {
      contractAddress: await getProxyAdminAddress(
        mainnet.provider,
        mainnet.unlockAddress
      ),
      calldata: ownable.encodeFunctionData('transferOwnership', [
        mainnet.multisig,
      ]),
    },
  ]

  // bridge calls to update safe/connext multisig plugins
  const bridgeCalls = await Promise.all(
    targetChains.map(async (network) => {
      const {
        dao: {
          governanceBridge: {
            modules: { connextMod },
          },
        },
        id: destChainId,
      } = network

      const connextModInterface = new ethers.Interface(ConnextMod)

      // parse calls for bridge
      const destCalls = [
        // set origin chain as base
        {
          contractAddress: connextMod,
          calldata: connextModInterface.encodeFunctionData('setOrigin', [
            base.dao.governanceBridge.domainId,
          ]),
        },
        {
          // set origin contract as base DAO timelock
          contractAddress: connextMod,
          calldata: connextModInterface.encodeFunctionData('setOriginSender', [
            BASE_TIMELOCK,
          ]),
        },
      ]
      const { to, value, data, operation } = await parseSafeMulticall({
        chainId: destChainId,
        calls: destCalls,
      })

      // encode multicall instructions to be executed by the SAFE
      const abiCoder = ethers.AbiCoder.defaultAbiCoder()
      const moduleData = abiCoder.encode(
        ['address', 'uint256', 'bytes', 'bool'],
        [
          to, // to
          value, // value
          data, // data
          operation, // operation: 0 for CALL, 1 for DELEGATECALL
        ]
      )

      const bridgeCall = await parseBridgeCall({
        destChainId,
        moduleData,
      })
      return bridgeCall
    })
  )

  const proposalName = `Transfer cross-chain governance to the Base DAO

This proposal transfers the control of the cross-chain governance to the DAO on Base.

It contains two main actions:

1. transfer ownership of Unlock contract + proxy admin on mainnet to a relay multisig (that can recevie instructions from Base)

2. set the “authority source” of all multisig on destination chains to the DAO timelock on Base

After executing this proposal, the DAO on mainnet will have transferred control of the main Unlock contracts to the DAO on Base. Going forward, any cross-chain governance proposals will need to originate from the DAO on Base. 
`

  return {
    proposalName,
    calls: [...mainnetCalls, ...bridgeCalls],
  }
}
