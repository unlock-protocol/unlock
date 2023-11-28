const contracts = require('@unlock-protocol/contracts')

const getUnlock = async (unlockAddress) => {
  const { ethers } = require('hardhat')
  // get unlock instance (TODO: do not use code version but packaged version)
  const { abi } = contracts['UnlockV12']
  const unlock = await ethers.getContractAt(abi, unlockAddress)
  return unlock
}

export default {
  getUnlock,
}
