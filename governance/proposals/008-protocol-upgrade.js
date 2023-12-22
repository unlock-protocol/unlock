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
const deployPublicLock = require('../scripts/deployments/publicLock')
const deployImpl = require('../scripts/upgrade/prepare')

const targetChains = Object.keys(networks)
  .map((id) => networks[id])
  .filter(
    ({ governanceBridge, isTestNetwork, id }) =>
      !isTestNetwork && !!governanceBridge && id != 1
  )

module.exports = async () => {
  const unlockVersion = 13
  const publicLockVersion = 14

  //
  const targetChain = networks[1] //targetChains[0]
  const { unlockAddress, name, id } = targetChain
  console.log(`Deploying to ${name}(${id}) - Unlock: ${unlockAddress}`)

  // deploy publicLock
  const publicLockAddress = await deployPublicLock({ publicLockVersion })

  // submit template to Unlock
  const { interface: unlockInterface } = await ethers.getContractAt(
    UnlockV13.abi,
    unlockAddress
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
  ]

  // deploy unlock impl
  const unlockImplAddress = await deployImpl({
    proxyAddress: unlockAddress,
    contractName: 'Unlock',
    contractVersion: unlockVersion,
  })

  // submit Unlock upgrade
  const proxyAdminAddress = await getProxyAdminAddress({ network })
  const { interface: proxyAdminInterface } = await ethers.getContractAt(
    proxyAdminABI,
    proxyAdminAddress
  )
  calls.push({
    contractAddress: proxyAdminAddress,
    functionName: 'upgrade',
    calldata: proxyAdminInterface.encodeFunctionData('upgrade', [
      unlockAddress,
      unlockImplAddress,
    ]),
  })

  const proposalName = `Upgrade protocol: switch to Unlock v13 and PublicLock v14`

  return {
    proposalName,
    calls,
  }
}
