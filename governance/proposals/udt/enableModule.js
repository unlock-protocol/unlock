/**
 * This script is used to setup a fresh install of SAFE modules used
 * for cross chain governance.
 *
 * For deployments, see `./scripts/deploy_multisig_mods`
 */

const { networks } = require('@unlock-protocol/networks')
const { ethers } = require('hardhat')
const {
  DelayMod: delayModAbi,
  ConnextMod: connextModAbi,
} = require('../../helpers/bridge')

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  console.log(`Sending on ${chainId}`)
  const {
    governanceBridge: {
      modules: { delayMod: delayModAddress, connextMod: connextModAddress },
    },
    multisig,
  } = networks[chainId]

  console.log({ delayModAddress, connextModAddress })

  if (!delayModAddress || !connextModAddress) {
    throw Error('Missing bridge SAFE modules.')
  }

  // parse contracts
  const delayMod = await ethers.getContractAt(delayModAbi, delayModAddress)
  const connextMod = await ethers.getContractAt(
    connextModAbi,
    connextModAddress
  )

  // make sure config is correct
  if (
    (await delayMod.getFunction('target')()) != multisig ||
    (await connextMod.getFunction('target')()) != delayModAddress
  ) {
    throw Error(`Config error in SAFE modules. Should be:
    - delayMod target : ${multisig}
    - connextMod target ${delayModAddress}
    `)
  }

  // enable Connext as a sub-module of Delay
  if (!(await delayMod.isModuleEnabled(connextModAddress))) {
    const tx = await delayMod.enableModule(connextModAddress)
    console.log(tx)
  }

  // make sure ownership of the modules has been transferred to the safe
  if ((await delayMod.owner()) != multisig) {
    console.log('Transferring ownership of Delay module to SAFE.')
    await delayMod.transferOwnership(multisig)
  }
  if ((await connextMod.owner()) != multisig) {
    console.log('Transferring ownership of Connext module to SAFE.')
    await connextMod.transferOwnership(multisig)
  }

  // parse call to enable the Delay module on multisig
  // NB: we use the delayMod `enableModule` ABI as it is identical to the one in SAFE
  const functionName = 'enableModule'
  const functionArgs = [delayModAddress]
  const calldata = delayMod.interface.encodeFunctionData('enableModule', [
    delayModAddress,
  ])

  const calls = [
    {
      functionName,
      functionArgs,
      contractAddress: multisig,
      calldata,
    },
  ]

  // return actual call
  const proposalArgs = {
    calls,
    proposalName: 'Enable Delay and Connext modules on multisig',
  }

  return proposalArgs
}

module.exports = main
