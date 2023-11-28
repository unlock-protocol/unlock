const { networks } = require('@unlock-protocol/networks')
const contracts = require('@unlock-protocol/contracts')
const ERC20_ABI = require('./ABIs/erc20.json')

const getUnlock = async (unlockAddress) => {
  const { ethers } = require('hardhat')
  if (!unlockAddress) {
    unlockAddress = await getUnlockAddress()
  }
  // get unlock instance (TODO: do not use code version but packaged version)
  const { abi } = contracts['UnlockV12']
  const unlock = await ethers.getContractAt(abi, unlockAddress)
  return unlock
}

const getUdt = async () => {
  const { ethers } = require('hardhat')
  const unlock = await getUnlock()
  const udt = await ethers.getContractAt(ERC20_ABI, await unlock.udt())
  return udt
}

const getUnlockAddress = async () => {
  const { unlockAddress } = await getNetwork()
  return unlockAddress
}

const getNetwork = async () => {
  const { ethers } = require('hardhat')
  const { chainId } = await ethers.provider.getNetwork()
  return networks[chainId]
}

export default {
  getUnlock,
  getUnlockAddress,
  getUdt,
  getNetwork,
}
