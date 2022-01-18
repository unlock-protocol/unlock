import { ethers } from 'hardhat'
import abis from '../../abis'
import bytecode from '../../bytecode'

/**
 * Deploys the unlock contract and initializes it.
 * This will call the callback twice, once for each transaction
 */
export default async (version, signer, callback) => {
  // First, deploy the contract
  const Unlock = await ethers.getContractFactory(
    abis.Unlock[version].abi,
    bytecode.Unlock[version],
    signer
  )
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
