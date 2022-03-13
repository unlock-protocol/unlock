const ethers = require('ethers')

const abi = [
  {
    constant: true,
    inputs: [{ internalType: 'address', name: '_keyOwner', type: 'address' }],
    name: 'getHasValidKey',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

async function hasValidKey(providerUrl, lockAddress, userAddress) {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl)
  const lock = new ethers.Contract(lockAddress, abi, provider)
  return lock.getHasValidKey(userAddress)
}

module.exports = hasValidKey
