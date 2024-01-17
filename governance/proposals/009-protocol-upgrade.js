/**
 * This proposal upgrade the protocol to new versions of the main contracts
 * Unlock v13 and PublicLock v14
 */
const { network, ethers } = require('hardhat')
const { UnlockV13 } = require('@unlock-protocol/contracts')
const { networks } = require('@unlock-protocol/networks')
const {
  getProxyAdminAddress,
  getNetwork,
  ADDRESS_ZERO,
} = require('@unlock-protocol/hardhat-helpers')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

// TODO: move to hardhat-helpers
const abiIConnext = [
  {
    inputs: [
      {
        internalType: 'uint32',
        name: '_destination',
        type: 'uint32',
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_asset',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_delegate',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_slippage',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_callData',
        type: 'bytes',
      },
    ],
    name: 'xcall',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
]

// addresses
const deployedContracts = {
  1: {
    unlockImplAddress: '0xd8250925527e769d90C6F2Fc55384B9110f26b62',
    publicLockAddress: '0xc9577b38ADA2B1b251EE99e54cC399027d547B68',
  },
  10: {
    publicLockAddress: '0x530Ff2dAED410cA7D70C25f18dc770f106201151',
    unlockImplAddress: '0x508619074f542b6544c5835f260CC704E988cf65',
  },
  56: {
    publicLockAddress: '0xA8BB5AF09B599794136B14B112e137FAf83Acf1f',
    unlockImplAddress: '0xfe9fD6af67E48D9f05Aa88679Ac294E3f28532eE',
  },
  100: {
    // verif files (Error Details: Missing or invalid ApiKey)
    publicLockAddress: '0xeAd6d1877452383ab5F74c689b6C3d0538Fd3008', // not verified
    unlockImplAddress: '0x24BF5517Ecc83caB64478Ab3D69950aA1567eB89', // not verified
  },
  137: {
    publicLockAddress: '0x8231d6fD0221C01FCAc5827EdD20D1aeC28EeBe3',
    unlockImplAddress: '0x4132f269168375DBf7DcDb2cfEA348F453FD4B40',
  },
  42161: {
    publicLockAddress: 'null',
    unlockImplAddress: '0xe49f5FD63cD7ec130B07dad30f068CC08F201e1e',
  },
}

const parseCalls = async ({ unlockAddress, name, id }) => {
  const publicLockVersion = 14

  //
  const { publicLockAddress, unlockImplAddress } = deployedContracts[id]

  if (!publicLockAddress || !unlockImplAddress) {
    throw Error(`missing contract on chain ${name}(${id})`)
  }

  console.log(`Parsing calls for ${name}(${id}) - Unlock: ${unlockAddress}`)

  // submit template to Unlock
  const { interface: unlockInterface } = await ethers.getContractAt(
    UnlockV13.abi,
    unlockAddress
  )

  // submit Unlock upgrade
  const proxyAdminAddress = await getProxyAdminAddress({ network })
  const { interface: proxyAdminInterface } = await ethers.getContractAt(
    proxyAdminABI,
    proxyAdminAddress
  )

  const calls = [
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
    {
      contractAddress: proxyAdminAddress,
      explainer: `upgrade(${unlockAddress},${unlockImplAddress})`,
      calldata: proxyAdminInterface.encodeFunctionData('upgrade', [
        unlockAddress,
        unlockImplAddress,
      ]),
    },
  ]

  return calls
}

module.exports = async () => {
  const targetChains = Object.keys(networks)
    .filter((id) => Object.keys(deployedContracts).includes(id.toString()))
    .filter((id) => id != 1)
    .map((id) => networks[id])

  // src info
  const { id: chainId } = await getNetwork()
  console.log(
    `from ${chainId} to chains ${targetChains.map(({ id }) => id).join(' - ')}`
  )

  const {
    governanceBridge: { connext: bridgeAddress },
  } = networks[chainId]

  // parse all calls for dest chains
  const calls = await Promise.all(
    targetChains.map((targetChain) => parseCalls(targetChain))
  )

  // get all the calls
  const bridgeCalls = []
  const explainers = {}

  await Promise.all(
    targetChains.map(async (network, i) => {
      const { governanceBridge, id: destChainId } = network

      // make sure we have bridge info in networks package
      if (!governanceBridge) return {}

      const {
        domainId: destDomainId,
        modules: { connextMod: destAddress },
      } = governanceBridge

      if (!destDomainId || !destAddress) {
        throw Error('Missing bridge information')
      }

      const destCalls = calls[i]
      explainers[destChainId] = []

      const abiCoder = ethers.AbiCoder.defaultAbiCoder()
      await Promise.all(
        destCalls.map(async ({ contractAddress, calldata, explainer }) => {
          // encode instructions to be executed by the SAFE
          const moduleData = await abiCoder.encode(
            ['address', 'uint256', 'bytes', 'bool'],
            [
              contractAddress, // to
              0, // value
              calldata, // data
              0, // operation: 0 for CALL, 1 for DELEGATECALL
              // 0,
            ]
          )
          console.log(moduleData)

          // organized explanations per chain
          explainers[destChainId].push({ explainer, contractAddress })

          // add to the list of calls to be passed to the bridge
          bridgeCalls.push({
            contractAddress: bridgeAddress,
            contractNameOrAbi: abiIConnext,
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
    })
  )

  console.log(bridgeCalls)

  // set proposal name
  const proposalName = `Upgrade protocol: switch to Unlock v13 and PublicLock v14
  
## Goal of the proposal

This is a proposal for an upgrade of the core Unlock Protocol smart contracts - with the new Unlock Version (v13) and PublicLock version (v14). 

## About the upgrade

This upgrade includes improved mechanics for UDT token governance, several improvements in existing features, gas optimisations and bug fixes. The main novelty is the new “swap and burn” feature that will allow fees collected by the protocol to directly decrease the supply of UDT in circulation.

## A cross-chain proposal

The proposal uses a cross-chain proposal pattern that, once passed, will deploy the upgrade on multiple chains at once. This pattern has been introduced and tested in a [previous proposal](https://www.tally.xyz/gov/unlock/proposal/1926572528290918174819693611122933562560576845671089759587616947457423587439).

## The calls

All calls are sent to the Connext bridge at ${bridgeAddress} on chain ${chainId}:
  
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
  console.log(proposalName)
  return {
    proposalName,
    calls: bridgeCalls,
  }
}
