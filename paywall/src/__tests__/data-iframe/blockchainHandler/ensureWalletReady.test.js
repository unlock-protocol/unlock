import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'

jest.useFakeTimers()
describe('blockchain handler waitForReady', () => {
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

  it('succeeds immediately if walletService is ready', async () => {
    expect.assertions(1)
    const once = jest.fn()

    await ensureWalletReady({ ready: true, once })

    expect(once).not.toHaveBeenCalled()
  })

  it('succeed eventually when walletService emits ready', done => {
    expect.assertions(1)
    const once = jest.fn()

    ensureWalletReady({ ready: false, once }).then(() => done())

    expect(once).toHaveBeenCalledWith('ready', expect.any(Function))
    once.mock.calls[0][1]()
  })
})
