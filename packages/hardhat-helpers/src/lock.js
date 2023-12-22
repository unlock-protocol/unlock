const { ethers, Interface } = require('ethers')
const { ADDRESS_ZERO } = require('./constants')

export const createLockCalldata = async ({
  args, // func args to unpack
  from = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // default hardhat signer
  signature = 'initialize(address,uint256,address,uint256,uint256,string)', // solidity signature string
}) => {
  const abi = [`function ${signature}`]
  const { interface: iface } = new ethers.Contract(ADDRESS_ZERO, abi)
  const calldata = await iface.encodeFunctionData(signature, [from, ...args])
  return calldata
}

export default { createLockCalldata }
