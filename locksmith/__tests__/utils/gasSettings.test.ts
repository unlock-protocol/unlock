import { vi } from 'vitest'
import { getGasSettings } from '../../src/utils/gasSettings'

vi.mock('@unlock-protocol/networks', async () => {
  const networks = await vi.importActual<any>('@unlock-protocol/networks')
  const items = {
    ...networks,
    '123': {
      publicProvider: null,
    },
  }
  return {
    default: items,
  }
})

vi.mock('ethers', async () => {
  const { ethers, BigNumber } = await vi.importActual<any>('ethers')
  return {
    BigNumber,
    ethers: {
      ...ethers,
      providers: {
        JsonRpcProvider: vi.fn((providerUrl: string) => ({
          // when providerUrl is undefined gasFeeData throws
          getFeeData: providerUrl
            ? vi.fn(async () => ({
                maxFeePerGas: BigNumber.from(10000000000),
                maxPriorityFeePerGas: BigNumber.from(10000000000),
                catch: vi.fn(() => null),
              }))
            : vi.fn(() => Promise.reject()),
        })),
      },
      Wallet: vi.fn(),
    },
  }
})

vi.mock('isomorphic-fetch', () => {
  return {
    default: async () => ({
      json: async () => ({ fast: { maxPriorityFee: 36.37, maxFee: 36.37 } }),
    }),
  }
})

describe('getGasSettings', () => {
  it('returns correct value from provider', async () => {
    expect.assertions(2)
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(1)
    expect(maxFeePerGas?.toNumber()).toBe(20000000000)
    expect(maxPriorityFeePerGas?.toNumber()).toBe(20000000000)
  })
  it('returns value from gas station on Polygon mainnet', async () => {
    expect.assertions(2)
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(137)
    expect(maxFeePerGas?.toNumber()).toBe(74000000000)
    expect(maxPriorityFeePerGas?.toNumber()).toBe(74000000000)
  })
  it('returns default value if gasFee fails ', async () => {
    expect.assertions(3)
    const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
      await getGasSettings(123)
    expect(gasPrice?.toNumber()).toBe(40000000000)
    expect(maxFeePerGas?.toNumber()).toBe(undefined)
    expect(maxPriorityFeePerGas?.toNumber()).toBe(undefined)
  })
})
