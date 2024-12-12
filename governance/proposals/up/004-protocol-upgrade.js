/**
 * This proposal upgrade the protocol to new versions of the main contracts
 * Unlock v14 and PublicLock v15
 */
const { ethers } = require('hardhat')
const { UnlockV14, PublicLockV15 } = require('@unlock-protocol/contracts')
const { networks } = require('@unlock-protocol/networks')
const { targetChains } = require('../../helpers/bridge')
const { parseBridgeCall } = require('../../helpers/crossChain')

const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

const { parseSafeMulticall } = require('../../helpers/multisig')
const { addSomeETH } = require('@unlock-protocol/hardhat-helpers')

// deployment addresses
const deployedContracts = {
  // mainnet
  1: {
    unlockImplAddress: '0x93c8b77D9bB8dFF1D628e3991443C809a13Ca98E',
    publicLockAddress: '0x77694145408ac958Ed747a1aD55192025B22bdd6',
  },
  // optimism
  10: {
    publicLockAddress: '0xEBe5a6A322E6aa9aF2414f5632dEeABB5ca5c60F',
    unlockImplAddress: '0x40E57487d5C7a53293ad83042D0cF4b9ffA3D833',
  },
  // binance
  56: {
    publicLockAddress: '0xE1a7Ec44fB4c5c88ebB3744A9Ba2A3cCA879A47d',
    unlockImplAddress: '0x5814B64C69ae89f152859d20f53B240df1AC5066',
  },
  // gnosis
  100: {
    publicLockAddress: '0xF05a4Ec7C2106A9767Da776C3a484F3396D4cdb9',
    unlockImplAddress: '0xED95D4B52b49Eaa77427c83AA81775dB9F69Ba21',
  },
  // polygon
  137: {
    publicLockAddress: '0x3D234f0e0F5B5A238DB94EE7fFfDc5e1c41Bf1d6',
    unlockImplAddress: '0x6a372BE86D515b0C8fc828650C574fe4c9A65Bd5',
  },
  // arb
  42161: {
    publicLockAddress: '0x9bA1F0aD35795A836eF8Fa089E3Fd2bE4A97dD94',
    unlockImplAddress: '0x2e5F6B31d100C527B782e26953D9509C591aC41d',
  },
  // base
  8453: {
    publicLockAddress: '0x77694145408ac958Ed747a1aD55192025B22bdd6',
    unlockImplAddress: '0x93c8b77D9bB8dFF1D628e3991443C809a13Ca98E',
  },
  //linea
  59144: {
    // linea max size because stil using paris evm
    // so had to deploy with settings.optimizer.runs = 1
    publicLockAddress: '0x5814B64C69ae89f152859d20f53B240df1AC5066',
    unlockImplAddress: '0x530Ff2dAED410cA7D70C25f18dc770f106201151',
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

const parseCalls = async ({
  unlockAddress,
  name,
  id,
  provider: providerURL,
}) => {
  const publicLockVersion = 15

  // get addresses
  const { publicLockAddress, unlockImplAddress } = deployedContracts[id]

  if (!publicLockAddress || !unlockImplAddress) {
    throw Error(`missing contract on chain ${name}(${id})`)
  }

  // submit template to Unlock
  const { interface: unlockInterface } = await ethers.getContractAt(
    UnlockV14.abi,
    unlockAddress
  )

  // add version check
  const provider = new ethers.JsonRpcProvider(providerURL)
  const unlock = new ethers.Contract(
    unlockImplAddress,
    unlockInterface,
    provider
  )
  const template = new ethers.Contract(
    publicLockAddress,
    PublicLockV15.abi,
    provider
  )
  if (
    (await unlock.unlockVersion()) !== BigInt(14) ||
    (await template.publicLockVersion()) !== BigInt(15)
  ) {
    throw Error(
      `Wrong versions. 
      Unlock v${await unlock.unlockVersion()} and 
    PublicLockv ${await template.publicLockVersion()}
    Checks failed.`
    )
  }

  // submit Unlock upgrade
  const proxyAdminAddress = await getProxyAdminAddress(
    unlockAddress,
    providerURL
  )
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
  const { chainId: daoChainId } = networks[chainId].dao

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

  console.log(
    `Targets chains: ${targetChains.map(({ id, name }) => `${name}(${id})`).join(',')}`
  )
  // parse all calls for dest chains
  const contractCalls = await Promise.all(
    targetChains.map((targetChain) => parseCalls(targetChain))
  )

  // get all the calls
  const bridgeCalls = await Promise.all(
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
      return bridgeCall
    })
  )

  const calls = [...daoNetworkCalls, ...bridgeCalls]

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
  console.log(proposalName)
  return {
    proposalName,
    calls,
    explainers,
  }
}
