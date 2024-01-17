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
  // 42161: {
  //   // need ARB funds
  //   publicLockAddress: null,
  //   unlockImplAddress: null,
  // },
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
      functionName: 'addLockTemplate', // explainer
      calldata: unlockInterface.encodeFunctionData('addLockTemplate', [
        publicLockAddress,
        publicLockVersion,
      ]),
    },
    {
      contractAddress: unlockAddress,
      functionName: 'setLockTemplate', // explainer
      calldata: unlockInterface.encodeFunctionData('setLockTemplate', [
        publicLockAddress,
      ]),
    },
    {
      contractAddress: proxyAdminAddress,
      functionName: 'upgrade',
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
  const explainers = []

  await Promise.all(
    targetChains.map(async (network, i) => {
      const { governanceBridge, id: destChainId, name: destChainName } = network

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

      const abiCoder = ethers.AbiCoder.defaultAbiCoder()
      await Promise.all(
        destCalls.map(async ({ contractAddress, calldata, functionName }) => {
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

          // add a small explanation
          explainers.push([
            destChainId,
            destChainName,
            functionName,
            contractAddress,
          ])

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
  
  # The calls

  All calls are sent to the Connext bridge at ${bridgeAddress} on chain ${chainId}:
  
  ${explainers
    .map(
      ([destChainId, destChainName, functionName, destAddress]) =>
        `- \`${functionName}\` from ${destAddress} on chain ${destChainName} (${destChainId})`
    )
    .join('\n')}
  
  
Onwards !

The Unlock Protocol Team
`

  return {
    proposalName,
    bridgeCalls,
  }
}
