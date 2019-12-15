import axios from 'axios'
import { ethers } from 'ethers'

import configure from '../config'

const config = configure()

/**
 * Function which asks the user to sign his email address and then
 * saves it inside of the token.
 * For now, we save it for all of the locks (one signature, but multiple requests to locksmith...)
 * @param {*} email
 */
export const saveEmail = async (web3Provider, locks, email) => {
  const wallet = web3Provider.getSigner()
  const userAddress = await wallet.getAddress()
  const tokenMetadata = JSON.stringify({
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
        {
          name: 'salt',
          type: 'bytes32',
        },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'UserMetaData',
    message: {
      UserMetaData: {
        owner: userAddress,
        data: {
          protected: {
            email,
          },
        },
      },
    },
  })

  const signature = await web3Provider.send('personal_sign', [
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes(tokenMetadata)),
    userAddress.toLowerCase(),
  ])

  const promises = locks.map(async lock => {
    const tokenEndpoint = `${config.locksmithUri}/api/key/${lock}/user/${userAddress}`

    try {
      await axios.put(tokenEndpoint, tokenMetadata, {
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer-Simple ${btoa(signature)}`,
        },
      })
    } catch (error) {
      return false
    }
    return true
  })
  const results = await Promise.all(promises)
  return results.reduce((acc, value) => acc && value, true)
}

/**
 * Function which yields a user's email address if it was saved for a lock
 * @param {*} web3Provider
 * @param {*} lockAddress
 */
export const getEmail = async (web3Provider, lockAddress) => {
  const wallet = web3Provider.getSigner()
  const userAddress = await wallet.getAddress()
  const now = Date.now()

  const tokenMetadata = JSON.stringify({
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
        {
          name: 'salt',
          type: 'bytes32',
        },
      ],
      KeyMetadata: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'KeyMetadata',
    message: {
      UserMetaData: {
        owner: userAddress,
        timestamp: now,
      },
    },
  })

  const signature = await web3Provider.send('personal_sign', [
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes(tokenMetadata)),
    userAddress.toLowerCase(),
  ])

  const tokenEndpoint = `${config.locksmithUri}/api/key/${lockAddress}/user/${userAddress}?`

  try {
    const response = await axios.get(tokenEndpoint, {
      params: {
        data: tokenMetadata,
      },
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer-Simple ${btoa(signature)}`,
      },
    })
    if (
      response.data &&
      response.data.userMetadata &&
      response.data.userMetadata.protected
    ) {
      return response.data.userMetadata.protected.email
    }
    return null
  } catch (error) {
    return null
  }
}

export default {
  saveEmail,
}
