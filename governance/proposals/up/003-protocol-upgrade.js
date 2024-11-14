/**
 * This proposal upgrade the protocol to new versions of the main contracts
 * Unlock v14 and PublicLock v15
 */
const { ethers } = require('hardhat')
const { UnlockV13 } = require('@unlock-protocol/contracts')
const { networks } = require('@unlock-protocol/networks')
const { IConnext, targetChains } = require('../../helpers/bridge')

const {
  getProxyAdminAddress,
  getNetwork,
  ADDRESS_ZERO,
} = require('@unlock-protocol/hardhat-helpers')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

const { parseSafeMulticall } = require('../../helpers/multisig')

// addresses
const deployedContracts = {
  1: {
    unlockImplAddress: '',
    publicLockAddress: '',
  },
  10: {
    publicLockAddress: '',
    unlockImplAddress: '',
  },
  56: {
    publicLockAddress: '',
    unlockImplAddress: '',
  },
  100: {
    publicLockAddress: '',
    unlockImplAddress: '',
  },
  137: {
    publicLockAddress: '',
    unlockImplAddress: '',
  },
  8453: {
    publicLockAddress: '',
    unlockImplAddress: '',
  },
  42161: {
    publicLockAddress: '',
    unlockImplAddress: '',
  },
}

const parseCalls = async ({ unlockAddress, name, id }) => {
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
  const proxyAdminAddress = await getProxyAdminAddress({ chainId: id })
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
  const { id: chainId } = await getNetwork()
  const {
    governanceBridge: { connext: bridgeAddress },
  } = networks[chainId].dao

  // store some explanations
  const explainers = {}

  // parse calls for mainnet
  const daoNetworkCalls = await parseCalls(networks[1])
  explainers[1] = daoNetworkCalls

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

      // parse calls for Safe
      const moduleData = await parseSafeMulticall(destCalls)

      // add to the list of calls to be passed to the bridge
      bridgeCalls.push({
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
      })
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
