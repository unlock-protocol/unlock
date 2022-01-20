import { ethers } from 'hardhat'
import * as abis from '@unlock-protocol/contracts'

/**
 * Deploys the unlock contract and initializes it.
 * This will call the callback twice, once for each transaction
 */
export default async (version, callback) => {
  const [signer] = await ethers.getSigners()
  const { abi, bytecode } = abis[`Unlock${version.toUpperCase()}`]

  // First, deploy the contract
  const Unlock = await ethers.getContractFactory(abi, bytecode, signer)
  const unlockContract = await Unlock.deploy()
  if (callback) {
    callback(null, unlockContract.deployTransaction.hash)
  }

  await unlockContract.deployed()

  // Let's now run the initialization
  const address = await signer.getAddress()
  const writableUnlockContract = unlockContract.connect(signer)
  const transaction = await writableUnlockContract.initialize(address)
  if (callback) {
    callback(null, transaction.hash)
  }
  await transaction.wait()
  return unlockContract.address
}
