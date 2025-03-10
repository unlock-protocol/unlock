import { networks } from '@unlock-protocol/networks'
import { JsonRpcProvider } from 'ethers'
import { expect, test, describe, beforeEach, vi } from 'vitest'

// A simple test file that queries the provider and checks all the supported networks are returning the right network ID
describe('worker', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test.skip('get network id via endpoint (integration test)', async () => {
    // This test is skipped by default as it requires an actual endpoint
    // To run it: ENDPOINT=https://your-rpc-endpoint yarn test
    if (!process.env.ENDPOINT) {
      console.warn('Skipping network test - No ENDPOINT provided')
      return
    }

    for (const id of Object.keys(networks)) {
      if (id !== '31337') {
        const provider = new JsonRpcProvider(`${process.env.ENDPOINT}/${id}`)
        const { chainId } = await provider.getNetwork()
        expect(chainId).to.equal(BigInt(parseInt(id, 10)))
      }
    }
  })

  test('network IDs are correctly configured', () => {
    // This test simply verifies the network configuration without making external calls
    for (const id of Object.keys(networks)) {
      if (id !== '31337') {
        const network = networks[id]
        // Check that network ID in config matches the key
        expect(network.id).to.equal(parseInt(id, 10))
        // Check that network has a provider URL
        expect(network.provider).to.be.a('string')
        expect(network.provider.startsWith('http')).to.be.true
      }
    }
  })
})
