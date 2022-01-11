import { ethers } from 'ethers'
import {
  getNameOrAddressForAddress,
  getAddressForName,
} from '../../hooks/useEns'

jest.mock('ethers')

describe('getNameOrAddressForAddress', () => {
  beforeAll(() => {
    ethers.providers.JsonRpcProvider = jest.fn(() => {
      return {
        lookupAddress: () => {
          return 'julien51.eth'
        },
      }
    })
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
    ethers.providers.JsonRpcProvider = jest.fn(() => {
      return {
        resolveName: () => {
          return '0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E'
        },
      }
    })
  })

  it('should yield the name if there is one', async () => {
    expect.assertions(1)
    const name = await getAddressForName('julien51.eth')
    expect(name).toEqual('0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E')
  })
})
