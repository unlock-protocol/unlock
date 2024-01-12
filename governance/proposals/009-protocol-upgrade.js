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
  1: {
    swapBurnerAddress: '',
    publicLockAddress: '',
    unlockImplAddress: '',
  },
}

const parseCalls = async ({ unlockAddress, name, id }) => {
  const publicLockVersion = 14

  //
  const { swapBurnerAddress, publicLockAddress, unlockImplAddress } =
    deployedContracts[id]

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
}

module.exports = async () => {
  const targetChains = Object.keys(networks)
    .map((id) => networks[id])
    .filter(
      ({ governanceBridge, isTestNetwork, id }) =>
        !isTestNetwork && !!governanceBridge && id != 1
    )

  // parse all calls
  const calls = await Promise.all(
    targetChains.map((targetChain) => parseCalls(targetChain))
  )

  // set proposal name
  const proposalName = `Upgrade protocol: switch to Unlock v13 and PublicLock v14`

  return {
    proposalName,
    calls,
  }
}
