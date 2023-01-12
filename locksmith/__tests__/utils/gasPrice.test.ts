import { BigNumber } from 'ethers'
import GasPrice from '../../src/utils/gasPrice'
import { vi } from 'vitest'
// mock coinbase API
vi.mock('isomorphic-fetch', () => {
  return {
    default: async () => ({
      json: async () => ({
        data: { base: 'ETH', currency: 'USD', amount: '420000' },
      }),
      ok: true,
    }),
  }
})

vi.mock('@unlock-protocol/networks', () => {
  return {
    default: {
      1: {},
      31137: {},
    },
  }
})

vi.mock('ethers', async () => {
  const original = await vi.importActual<any>('ethers')
  const item = {
    ...original,
    ethers: {
      providers: {
        JsonRpcProvider: vi.fn(() => ({
          getGasPrice: () => Promise.resolve(BigNumber.from(1e12).toString()),
        })),
      },
      Wallet: vi.fn(),
    },
  }
  return item
})

let gasPrice: any
const network = 1
describe('gasPrice', () => {
  beforeEach(() => {
    gasPrice = new GasPrice()
  })
  describe('gasPriceETH', () => {
    it('should convert decimals properly ', async () => {
      expect.assertions(3)
      await expect(gasPrice.gasPriceETH(network, 1)).resolves.toEqual(0.000001)
      await expect(gasPrice.gasPriceETH(network, 2)).resolves.toEqual(0.000002)
      await expect(gasPrice.gasPriceETH(network, 100)).resolves.toEqual(0.0001)
    })
  })
  describe('gasPriceUSD', () => {
    it('should convert properly to USD', async () => {
      expect.assertions(3)
      await expect(gasPrice.gasPriceUSD(network, 1)).resolves.toEqual(42)
      await expect(gasPrice.gasPriceUSD(network, 2)).resolves.toEqual(84)
      await expect(gasPrice.gasPriceUSD(network, 10)).resolves.toEqual(420)
    })
  })
})
