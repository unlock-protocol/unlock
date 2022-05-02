import { BigNumber } from 'ethers'
import GasPrice from '../../src/utils/gasPrice'
// mock coinbase API
jest.mock('isomorphic-fetch', () => async () => ({
  json: async () => ({
    data: { base: 'ETH', currency: 'USD', amount: '420000' },
  }),
}))

jest.mock('@unlock-protocol/networks', () => ({
  1: {},
  31137: {},
}))

jest.mock('ethers', () => {
  const original = jest.requireActual('ethers')
  return {
    ...original,
    ethers: {
      providers: {
        JsonRpcProvider: jest.fn(() => ({
          getGasPrice: () => Promise.resolve(BigNumber.from(1e12).toString()),
        })),
      },
      Wallet: jest.fn(),
    },
  }
})

let gasPrice: any
describe('gasPrice', () => {
  beforeEach(() => {
    gasPrice = new GasPrice()
  })
  describe('gasPriceETH', () => {
    it('should convert decimals properly ', async () => {
      expect.assertions(1)
      await expect(gasPrice.gasPriceETH(1)).resolves.toEqual(0.000001)
    })
  })
  describe('gasPriceUSD', () => {
    it('should convert properly to USD', async () => {
      expect.assertions(1)
      await expect(gasPrice.gasPriceUSD(1)).resolves.toEqual(42)
    })
  })
})
