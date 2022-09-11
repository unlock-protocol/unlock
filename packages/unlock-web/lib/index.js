import { ethers } from 'ethers'

/**
 * A shortened ABI for the lock since we only care about a small number 
 * of functions
 */
const abi = [{
  "inputs": [
    { "internalType": "address", "name": "_keyOwner", "type": "address" }
  ],
  "name": "totalKeys",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    { "internalType": "address", "name": "_keyOwner", "type": "address" },
    { "internalType": "uint256", "name": "_index", "type": "uint256" }
  ],
  "name": "tokenOfOwnerByIndex",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [
    { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }
  ],
  "name": "keyExpirationTimestampFor",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "view",
  "type": "function"
}]

/**
 * Returns a single membership
 * @param {*} network 
 * @param {*} lock 
 * @param {*} user 
 * @param {*} i 
 * @returns 
 */
const getMembership = async (network, lock, user, i) => {
  const provider = new ethers.providers.JsonRpcProvider(`https://rpc.unlock-protocol.com/${network}`)
  const contract = new ethers.Contract(lock, abi, provider)
  const tokenId = await contract.tokenOfOwnerByIndex(user, i)
  const expiration = await contract.keyExpirationTimestampFor(tokenId);
  return {
    network,
    lock,
    tokenId,
    expiration
  }
}

/**
 * Returns all the memberships for a user based on a paywall config
 * @returns 
 */
export const getMemberships = async (config, user) => {
  const _memberships = []
  await Promise.all(Object.keys(config.locks).map(async (lockAddress) => {
    const network = config.locks[lockAddress].network || config.network
    const provider = new ethers.providers.JsonRpcProvider(`https://rpc.unlock-protocol.com/${network}`)
    const contract = new ethers.Contract(lockAddress, abi, provider)
    const numberOfKeys = await contract.totalKeys(user)
    return Promise.all(new Array(numberOfKeys.toNumber()).fill(0).map(async (_, i) => {
      const membership = await getMembership(network, lockAddress, user, i)
      return _memberships.push(membership)
    }))
  }))
  return _memberships
}

/**
 * From code, returns an object of digest, signature and user.
 * @param {*} _code 
 * @returns 
 */
export const authenticateFromCode = (_code) => {
  const code = JSON.parse(Buffer.from(_code, 'base64'))
  const digest = code.d
  const signature = code.s
  const user = ethers.utils.verifyMessage(digest, signature)
  return {
    digest,
    signature,
    user
  }
}