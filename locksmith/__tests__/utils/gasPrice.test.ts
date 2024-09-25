import GasPrice from '../../src/utils/gasPrice'
import { vi, expect } from 'vitest'

vi.mock('../../src/operations/pricingOperations', () => {
  return {
    getDefiLlamaPrice: ({ network, erc20Address, amount = 1 }) => {
      return Promise.resolve({
        priceInAmount: amount * 420000, // Keeping tests simple
        decimals: 5,
      })
    },
  }
})

vi.mock('ethers', async () => {
  const original = await vi.importActual<any>('ethers')
  const provider = vi.fn(() => ({
    getFeeData: () => Promise.resolve({ gasPrice: BigInt(1e12) }),
  }))
  const item = {
    ...original,
    ethers: {
      ...original.ethers,
      JsonRpcProvider: provider,
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
