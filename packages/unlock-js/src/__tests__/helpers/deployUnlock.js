import fs from 'fs-extra'
import path from 'path'
import { ethers, run, upgrades } from 'hardhat'
import * as abis from '@unlock-protocol/contracts'

/**
 * Deploys the unlock contract and initializes it.
 * This will call the callback twice, once for each transaction
 */
export default async (version, callback) => {
  const [signer] = await ethers.getSigners()
  const versionNumber = parseInt(version.replace('v', ''))

  let unlockContract

  // starting with v10, openzeppelin requires to use upgradeable pattern to initialize the contract
  if (versionNumber >= 10) {
    const unlockName = `UnlockV${versionNumber}`
    // have to copy contract files over to make oz-upgrades happy
    const unlockSourcePath = require.resolve(
      `@unlock-protocol/contracts/dist/Unlock/${unlockName}.sol`
    )

    // dests
    const contractPath = path.resolve(
      `./src/__tests__/contracts/${unlockName}.sol`
    )
    const artifactPath = path.resolve(
      `./src/__tests__/artifacts/${unlockName}.sol`
    )

    // remove existing contracts if any
    await fs.remove(contractPath)
    await fs.remove(artifactPath)

    // copy contract source  over
    await fs.copy(unlockSourcePath, path.resolve(contractPath))

    // re-compile contract using hardhat
    await run('compile')

    // get compiled contract
    const Unlock = await ethers.getContractFactory(
      `src/__tests__/contracts/${unlockName}.sol:Unlock`
    )

    // deploy using proxy
    unlockContract = await upgrades.deployProxy(Unlock, [signer.address])
    if (callback) {
      callback(null, unlockContract.deployTransaction.hash)
    }
  } else {
    // deploy the contract from abis
    const { abi, bytecode } = abis[`Unlock${version.toUpperCase()}`]
    const Unlock = await ethers.getContractFactory(abi, bytecode, signer)

    unlockContract = await Unlock.deploy()
    if (callback) {
      callback(null, unlockContract.deployTransaction.hash)
    }
    await unlockContract.deployed()

    // run the initialization
    const address = await signer.getAddress()
    const writableUnlockContract = unlockContract.connect(signer)
    const transaction = await writableUnlockContract.initialize(address)
    if (callback) {
      callback(null, transaction.hash)
    }
    await transaction.wait()
  }
  return unlockContract.address
}
