import { ethers } from 'hardhat'
import abis from '../../abis'
import bytecode from '../../bytecode'

/**
 * Deploys a new template for locks
 * It's a regular lock, but it will never work (purchase function fails)
 * It just used as template whose address is fed into configUnlock to deploy
 * locks through a proxy (keeping gas prices much lower)
 * @param {*} version
 * @param {*} callback
 */
export default async (version, callback) => {
  const [signer] = await ethers.getSigners()
  const factory = await ethers.getContractFactory(
    abis.PublicLock[version].abi,
    bytecode.PublicLock[version],
    signer
  )

  const contract = await factory.deploy()

  if (callback) {
    callback(null, contract.deployTransaction.hash)
  }
  await contract.deployed()
  return contract.address
}
