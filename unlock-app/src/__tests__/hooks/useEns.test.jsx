import { ethers } from 'ethers'
import {
  getAddressForName,
} from '../../hooks/useEns'
import { vi, it, describe, beforeAll } from 'vitest'

vi.mock('ethers')


describe('getAddressForName', () => {
  beforeAll(() => {
    const fn = vi.fn(() => {
      return {
        resolveName: () => {
          return '0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E'
        },
      }
    })

    ethers.JsonRpcProvider = fn
    ethers.JsonRpcProvider = fn
  })

  it('should yield the name if there is one', async () => {
    expect.assertions(1)
    const name = await getAddressForName('julien51.eth')
    expect(name).toEqual('0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E')
  })
})
