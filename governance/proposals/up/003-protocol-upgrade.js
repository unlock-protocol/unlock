/**
 * This proposal upgrade the protocol to new versions of the main contracts
 * Unlock v14 and PublicLock v15
 */
const { ethers } = require('hardhat')
const { UnlockV13 } = require('@unlock-protocol/contracts')
const { networks } = require('@unlock-protocol/networks')
const { targetChains } = require('../../helpers/bridge')
const { parseBridgeCall } = require('../../helpers/crossChain')

const { getNetwork, ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

const { parseSafeMulticall } = require('../../helpers/multisig')

// addresses
const deployedContracts = {
  1: {
    unlockImplAddress: ADDRESS_ZERO,
    publicLockAddress: ADDRESS_ZERO,
  },
  10: {
    publicLockAddress: ADDRESS_ZERO,
    unlockImplAddress: ADDRESS_ZERO,
  },
  56: {
    publicLockAddress: ADDRESS_ZERO,
    unlockImplAddress: ADDRESS_ZERO,
  },
  100: {
    publicLockAddress: ADDRESS_ZERO,
    unlockImplAddress: ADDRESS_ZERO,
  },
  137: {
    publicLockAddress: ADDRESS_ZERO,
    unlockImplAddress: ADDRESS_ZERO,
    unlockSwapBurner: ADDRESS_ZERO,
  },
  42161: {
    publicLockAddress: ADDRESS_ZERO,
    unlockImplAddress: ADDRESS_ZERO,
  },
  8453: {
    publicLockAddress: ADDRESS_ZERO,
    unlockImplAddress: ADDRESS_ZERO,
  },
  59144: {
    publicLockAddress: ADDRESS_ZERO,
    unlockImplAddress: ADDRESS_ZERO,
  },
}

const getProxyAdminAddress = async (contractAddress, providerURL) => {
  const provider = new ethers.JsonRpcProvider(providerURL)

  const hex = await provider.getStorage(
    contractAddress,
    '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'
  )

  const adminAddress = ethers.stripZerosLeft(hex)
  return adminAddress
}

const parseCalls = async ({ unlockAddress, name, id, provider }) => {
  const publicLockVersion = 15

  // get addresses
  const { publicLockAddress, unlockImplAddress } = deployedContracts[id]

  if (!publicLockAddress || !unlockImplAddress) {
    throw Error(`missing contract on chain ${name}(${id})`)
  }

  // submit template to Unlock
  const { interface: unlockInterface } = await ethers.getContractAt(
    UnlockV13.abi,
    unlockAddress
  )

  // submit Unlock upgrade
  const proxyAdminAddress = await getProxyAdminAddress(unlockAddress, provider)
  const { interface: proxyAdminInterface } = await ethers.getContractAt(
    proxyAdminABI,
    proxyAdminAddress
  )

  // upgrade first then set the template
  const calls = [
    {
      contractAddress: proxyAdminAddress,
      explainer: `upgrade(${unlockAddress},${unlockImplAddress})`,
      calldata: proxyAdminInterface.encodeFunctionData('upgrade', [
        unlockAddress,
        unlockImplAddress,
      ]),
    },
    {
      contractAddress: unlockAddress,
      explainer: `addLockTemplate(${publicLockAddress},${publicLockVersion})`,
      calldata: unlockInterface.encodeFunctionData('addLockTemplate', [
        publicLockAddress,
        publicLockVersion,
      ]),
    },
    {
      contractAddress: unlockAddress,
      explainer: `setLockTemplate(${publicLockAddress})`,
      calldata: unlockInterface.encodeFunctionData('setLockTemplate', [
        publicLockAddress,
      ]),
    },
  ]

  return calls
}

module.exports = async () => {
  // src info
  const { id: chainId, unlockAddress, name, provider } = await getNetwork()
  const {
    governanceBridge: { connext: bridgeAddress },
    chainId: daoChainId,
  } = networks[chainId].dao

  // store some explanations
  const explainers = {}

  // parse calls for mainnet
  const daoNetworkCalls = await parseCalls({
    id: daoChainId,
    unlockAddress,
    name,
    provider,
  })
  explainers[daoChainId] = daoNetworkCalls

  // parse all calls for dest chains
  const contractCalls = await Promise.all(
    targetChains.map((targetChain) => parseCalls(targetChain))
  )

  // get all the calls
  const bridgeCalls = []
  await Promise.all(
    targetChains.map(async (network, i) => {
      const { dao, id: destChainId } = network

      // make sure we have bridge info in networks package
      if (!dao) return {}

      const {
        domainId: destDomainId,
        modules: { connextMod: destAddress },
      } = dao.governanceBridge

      if (!destDomainId || !destAddress) {
        throw Error('Missing bridge information')
      }

      const destCalls = contractCalls[i]

      // store explainers
      explainers[destChainId] = destCalls

      // parse calls for Multisend
      const { to, value, data, operation } = await parseSafeMulticall({
        chainId: destChainId,
        calls: destCalls,
      })

      // encode multisend instructions to be executed by the SAFE
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

      // add to the list of calls to be passed to the bridge
      const bridgeCall = await parseBridgeCall({
        destChainId,
        moduleData,
      })
      bridgeCalls.push(bridgeCall)
    })
  )

  const calls = [
    // ...daoNetworkCalls,
    ...bridgeCalls,
  ]

  // set proposal name and text
  const proposalName = `Protocol upgrade: switch to Unlock v14 and PublicLock v15
  
This proposal will upgrade the core Unlock Protocol smart contracts with a new version of Unlock (v14) and PublicLock (v15). 

There are ${calls.length} contract calls in this proposals :
  
${Object.keys(explainers)
  .map((id) => {
    const lines = ['\n']
    lines.push(`### ${networks[id].name} (chain ${id}) \n`)
    explainers[id].forEach(({ explainer, contractAddress }) =>
      lines.push(
        `- \`${explainer}\` - ${
          explainer.includes('upgrade') ? 'ProxyAdmin' : 'Unlock'
        } at ${contractAddress}`
      )
    )
    return lines
  })
  .flat()
  .join('\n')}
  
Onwards !

The Unlock Protocol Team
`
  return {
    proposalName,
    calls,
    explainers,
  }
}
