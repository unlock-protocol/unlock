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
} = require('../helpers/bridge')

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  console.log(`Sending on ${chainId}`)
  const {
    dao: {
      governanceBridge: {
        modules: { delayMod: delayModAddress, connextMod: connextModAddress },
      },
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
    - delayMod target : ${multisig} (currently: ${await delayMod.getFunction('target')()})
    - connextMod target ${delayModAddress} (currently: ${await connextMod.getFunction('target')()})
    `)
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

  // NB: we use the delayMod abi as the `enableModule` function is identical to the one in SAFE
  const { interface } = delayMod
  const calls = [
    // parse call to enable the Connext module as a sub-module of Delay
    {
      contractAddress: delayModAddress,
      calldata: delayMod.interface.encodeFunctionData('enableModule', [
        connextModAddress,
      ]),
    },
    {
      // parse call to enable the Delay module on multisig
      contractAddress: multisig,
      calldata: interface.encodeFunctionData('enableModule', [delayModAddress]),
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
