/**
 * This proposal upgrade the protocol to new versions of the main contracts
 * Unlock v13 and PublicLock v14
 */
const { network, ethers } = require('hardhat')
const { UnlockV13 } = require('@unlock-protocol/contracts')
const { networks } = require('@unlock-protocol/networks')
const { getProxyAdminAddress } = require('@unlock-protocol/hardhat-helpers')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

// addresses
const deployedContracts = {
  10: {
    swapBurnerAddress: null,
    publicLockAddress: '0x530Ff2dAED410cA7D70C25f18dc770f106201151',
    unlockImplAddress: '0x508619074f542b6544c5835f260CC704E988cf65',
  },
  56: {
    swapBurnerAddress: null,
    publicLockAddress: '0xA8BB5AF09B599794136B14B112e137FAf83Acf1f',
    unlockImplAddress: '0xfe9fD6af67E48D9f05Aa88679Ac294E3f28532eE',
  },
  100: {
    // verif files (Error Details: Missing or invalid ApiKey)
    swapBurnerAddress: null,
    publicLockAddress: '0xeAd6d1877452383ab5F74c689b6C3d0538Fd3008', // not verified
    unlockImplAddress: '0x24BF5517Ecc83caB64478Ab3D69950aA1567eB89', // not verified
  },
  137: {
    swapBurnerAddress: null,
    publicLockAddress: '0x8231d6fD0221C01FCAc5827EdD20D1aeC28EeBe3',
    unlockImplAddress: '0x4132f269168375DBf7DcDb2cfEA348F453FD4B40',
  },
  42161: {
    // need ARB funds
    swapBurnerAddress: null,
    publicLockAddress: null,
    unlockImplAddress: null,
  },
}

const parseCalls = async ({ unlockAddress, name, id }) => {
  const publicLockVersion = 14

  //
  const { swapBurnerAddress, publicLockAddress, unlockImplAddress } =
    deployedContracts[id]

  if (!swapBurnerAddress || !publicLockAddress || !unlockImplAddress) {
    throw Error(`missing contract on chain ${name}(${id})`)
  }

  console.log(`Deploying to ${name}(${id}) - Unlock: ${unlockAddress}`)

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
    {
      contractAddress: unlockAddress,
      functionName: 'setSwapBurner', // explainer
      calldata: unlockInterface.encodeFunctionData('setSwapBurner', [
        swapBurnerAddress,
      ]),
    },
  ]

  return calls
}

module.exports = async () => {
  const targetChains = Object.keys(networks)
    .filter((id) => Object.keys(deployedContracts).includes(id.toString()))
    .map((id) => networks[id])

  // parse all calls
  const calls = await Promise.all(
    targetChains.map((targetChain) => parseCalls(targetChain))
  )

  console.log(calls)

  // set proposal name
  const proposalName = `Upgrade protocol: switch to Unlock v13 and PublicLock v14`

  return {
    proposalName,
    calls,
  }
}
