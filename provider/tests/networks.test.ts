import { networks } from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { expect, test, describe, beforeAll } from 'vitest'

// A simple test file that queries the provider and checks all the supported networks are returning the right network di

describe('worker', () => {
  beforeAll(async () => {
    if (!process.env.ENDPOINT) {
      throw new Error('Please set ENDPOINT as env variable')
    }
  })

  test('get network id', async () => {
    for (const id of Object.keys(networks)) {
      if (id !== '31337') {
        const provider = new ethers.providers.JsonRpcProvider(
          `${process.env.ENDPOINT}/${id}`
        )
        const { chainId } = await provider.getNetwork()
        expect(chainId).to.equal(parseInt(id, 10))
      }
    }
  })
})
