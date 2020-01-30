import { setUserMetadata } from '../../utils/setUserMetadata'

class MockWalletService {
  setUserMetadata: any

  constructor() {
    this.setUserMetadata = jest.fn()
  }

  connect() {}
}
let mockWalletService = new MockWalletService()

jest.mock('@unlock-protocol/unlock-js', () => {
  const mockUnlock = require.requireActual('@unlock-protocol/unlock-js') // Original module
  return {
    ...mockUnlock,
    WalletService() {
      return mockWalletService
    },
  }
})

const lockAddress = '0xlockaddress'
const userAddress = '0xuseraddress'

describe('setUserMetadata', () => {
  it('calls back on success', done => {
    expect.assertions(2)

    mockWalletService.setUserMetadata = jest.fn((_, callback) => {
      callback(undefined, 'success!')
    })

    const callback = (error: any, value: any) => {
      expect(error).toBeUndefined()
      expect(value).toBeTruthy()
      done()
    }

    setUserMetadata(lockAddress, userAddress, {}, callback)
  })

  it('calls back on error', done => {
    expect.assertions(2)

    mockWalletService.setUserMetadata = jest.fn((_, callback) => {
      callback(new Error('fail'), undefined)
    })

    const callback = (error: any, value: any) => {
      expect(error).toBeInstanceOf(Error)
      expect(value).toBeUndefined()
      done()
    }

    setUserMetadata(lockAddress, userAddress, {}, callback)
  })
})
