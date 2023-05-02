import * as useKeychain from '../../hooks/useKeychain'
import { vi, it, describe, expect } from 'vitest'

const mockWeb3Service = {
  transferFeeBasisPoints: vi.fn(() => Promise.resolve(10)),
  getAddressBalance: vi.fn(() => Promise.resolve(1)),
  getCancelAndRefundValueFor: vi.fn(() => Promise.resolve(0.1)),
}

vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

describe('useKeychain', () => {
  it('get amounts from getAmounts fn', async () => {
    expect.assertions(3)

    const res = await useKeychain.useKeychain({
      lockAddress: '0xCDb1839D1dcFd726e15437D595C6216219CA90E0',
      owner: '0x8D33b257bce083eE0c7504C7635D1840b3858AFD',
      network: 4,
      keyId: '1',
      tokenAddress: '0x',
    })

    const amounts = await res.getAmounts()
    expect(amounts.refundAmount).toBe(0.1)
    expect(amounts.transferFee).toBe(10)
    expect(amounts.lockBalance).toBe(1)
  })
})
