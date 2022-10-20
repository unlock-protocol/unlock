import { ethers } from 'hardhat'

/**
 * Sets a new template for locks
 * @param {string} unlockAddress
 * @param {string} templateAddress
 * @param {string} version
 * @param {*} callback
 */
export default async (
  unlockAddress,
  templateAddress,
  version,
  transactionOptions = {},
  callback
) => {
  const abi = [
    'function setLockTemplate(address _publicLockAddress)',
    'function addLockTemplate(address impl,uint16 version)',
  ]

  const unlock = await ethers.getContractAt(abi, unlockAddress)

  // add lock version
  const txAdd = await unlock.addLockTemplate(templateAddress, version)

  if (callback) {
    callback(null, txAdd.transactionHash)
  }

  // set as default
  const txSet = await unlock.setLockTemplate(templateAddress)
  if (callback) {
    callback(null, txSet.transactionHash)
  }
}
