import { vi, expect } from 'vitest'
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
  const { ethers } = await vi.importActual<any>('ethers')
  const provider = vi.fn((providerUrl: string) => ({
    // when providerUrl is undefined gasFeeData throws
    getFeeData: providerUrl
      ? vi.fn(async () => ({
          maxFeePerGas: BigInt(10000000000),
          maxPriorityFeePerGas: BigInt(10000000000),
          catch: vi.fn(() => null),
        }))
      : vi.fn(() => Promise.reject()),
  }))
  return {
    ethers: {
      ...ethers,
      JsonRpcProvider: provider,
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
  it.skip('returns correct value from provider', async () => {
    expect.assertions(2)
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(1)
    expect(maxFeePerGas).toBe(20000000000n)
    expect(maxPriorityFeePerGas).toBe(20000000000n)
  })
  it('returns value from gas station on Polygon mainnet', async () => {
    expect.assertions(2)
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(137)
    expect(maxFeePerGas).toBe(37000000000n)
    expect(maxPriorityFeePerGas).toBe(37000000000n)
  })
  it('returns default value if gasFee fails ', async () => {
    expect.assertions(3)
    const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
      await getGasSettings(123)
    expect(gasPrice).toBe(40000000000n)
    expect(maxFeePerGas).toBe(undefined)
    expect(maxPriorityFeePerGas).toBe(undefined)
  })
})
