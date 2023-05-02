import { ethers } from 'ethers'
import {
  getNameOrAddressForAddress,
  getAddressForName,
} from '../../hooks/useEns'
import { vi, it, describe, beforeAll } from 'vitest'

vi.mock('ethers')

describe('getNameOrAddressForAddress', () => {
  beforeAll(() => {
    const fn = vi.fn(() => {
      return {
        lookupAddress: () => {
          return 'julien51.eth'
        },
      }
    })
    ethers.providers.JsonRpcProvider = fn
    ethers.providers.JsonRpcBatchProvider = fn
  })

  it('should yield the name if there is one', async () => {
    expect.assertions(1)
    const name = await getNameOrAddressForAddress(
      '0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E'
    )
    expect(name).toEqual('julien51.eth')
  })
})

describe('getAddressForName', () => {
  beforeAll(() => {
    const fn = vi.fn(() => {
      return {
        resolveName: () => {
          return '0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E'
        },
      }
    })

    ethers.providers.JsonRpcProvider = fn
    ethers.providers.JsonRpcBatchProvider = fn
  })

  it('should yield the name if there is one', async () => {
    expect.assertions(1)
    const name = await getAddressForName('julien51.eth')
    expect(name).toEqual('0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E')
  })
})
