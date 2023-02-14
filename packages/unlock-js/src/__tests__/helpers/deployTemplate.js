import { ethers } from 'hardhat'
import * as abis from '@unlock-protocol/contracts'

/**
 * Deploys a new template for locks
 * It's a regular lock, but it will never work (purchase function fails)
 * It just used as template whose address is fed into configUnlock to deploy
 * locks through a proxy (keeping gas prices much lower)
 * @param {*} version
 * @param {*} callback
 */
export default async (version, transactionOptions = {}, callback) => {
  const [signer] = await ethers.getSigners()
  const { abi, bytecode } = abis[`PublicLock${version.toUpperCase()}`]
  const factory = await ethers.getContractFactory(abi, bytecode, signer)
  const contract = await factory.deploy()
  if (callback) {
    callback(null, contract.deployTransaction.hash)
  }
  await contract.deployed()
  return contract.address
}
