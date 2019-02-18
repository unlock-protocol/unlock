import walletService from '../../../services/walletService'
import WalletService from '../../../hooks/components/WalletService'

jest.mock('../../../services/walletService')
describe('WalletService component', () => {
  let callbacks = {}
  beforeEach(() => {
    walletService.mockImplementation(() => ({
      on: jest.fn((type, callback) => (callbacks[type] = callback)),
      connect: jest.fn(),
    }))
  })
})
