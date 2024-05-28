const { networks } = require('@unlock-protocol/networks')
const contracts = require('@unlock-protocol/contracts')
const ERC20_ABI = require('./ABIs/erc20.json')

export const getUnlock = async (unlockAddress) => {
  const { ethers } = require('hardhat')
  if (!unlockAddress) {
    unlockAddress = await getUnlockAddress()
  }
  // get unlock instance (TODO: do not use code version but packaged version)
  const { abi } = contracts['UnlockV13']
  const unlock = await ethers.getContractAt(abi, unlockAddress)
  return unlock
}

export const getUdt = async () => {
  const { ethers } = require('hardhat')
  const unlock = await getUnlock()
  const udt = await ethers.getContractAt(ERC20_ABI, await unlock.udt())
  return udt
}

export const getUnlockAddress = async () => {
  const { unlockAddress } = await getNetwork()
  return unlockAddress
}

export const getNetwork = async (chainId) => {
  const { ethers } = require('hardhat')
  if (!chainId) {
    ;({ chainId } = await ethers.provider.getNetwork())
  }
  return networks[chainId] || { name: 'localhost', id: chainId }
}

export default {
  getUnlock,
  getUnlockAddress,
  getUdt,
  getNetwork,
}
