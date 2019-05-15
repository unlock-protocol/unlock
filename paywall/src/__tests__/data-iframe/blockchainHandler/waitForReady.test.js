import waitForReady from '../../../data-iframe/blockchainHandler/waitForReady'

jest.useFakeTimers()
describe('blockchain handler waitForReady', () => {
  it('rejects if walletService is not set', async () => {
    expect.assertions(1)

    try {
      await waitForReady(false)
    } catch (e) {
      expect(e.message).toBe(
        'initialize walletService before retrieving data or sending transactions'
      )
    }
  })

  it('fails if walletService is not ready after 10 seconds', done => {
    expect.assertions(1)
    waitForReady({ once() {} }).catch(e => {
      expect(e.message).toBe('connecting to blockchain timed out')
      done()
    })
    jest.runAllTimers()
  })

  it('succeeds immediately if walletService is ready', async () => {
    expect.assertions(0)
    await waitForReady({ ready: true })
  })

  it('succeed eventually when walletService emits ready', done => {
    expect.assertions(1)
    const once = jest.fn()

    waitForReady({ ready: false, once }).then(() => done())

    expect(once).toHaveBeenCalledWith('ready', expect.any(Function))
    once.mock.calls[0][1]()
  })
})
