import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'

describe('blockchain handler waitForReady', () => {
  beforeEach(() => {
    setAccount(null)
  })

  it('rejects if walletService is not set', async () => {
    expect.assertions(1)

    try {
      await ensureWalletReady(false)
    } catch (e) {
      expect(e.message).toBe(
        'initialize walletService before retrieving data or sending transactions'
      )
    }
  })

  it('succeeds immediately if walletService is ready', async done => {
    expect.assertions(1)
    ensureWalletReady({ ready: true }).then(done)

    expect(true).toBe(true)
    setAccount('test')
  })

  it('succeed eventually when walletService emits ready', done => {
    expect.assertions(1)
    const once = jest.fn()

    ensureWalletReady({ ready: false, once }).then(() => done())

    expect(once).toHaveBeenCalledWith('ready', expect.any(Function))
    once.mock.calls[0][1]()
    setAccount('test')
  })
})
