import {
  setPurchaseKeyCallback,
  purchaseKey,
} from '../../../data-iframe/start/purchaseKeySetup'

jest.useFakeTimers()

describe('purchaseKeySetup', () => {
  it('waits for purchase to be set', async () => {
    expect.assertions(4)
    const purchase = jest.fn()
    let resolved = false

    purchaseKey('lock', 'tip')
      .then(() => (resolved = true))
      .then(() => expect(purchase).toHaveBeenCalledWith('lock', 'tip'))

    jest.runOnlyPendingTimers()
    await Promise.resolve()
    expect(resolved).toBe(false)

    setPurchaseKeyCallback(purchase)
    jest.runOnlyPendingTimers()
    await Promise.resolve()

    expect(resolved).toBe(false)
    await Promise.resolve()
    expect(resolved).toBe(true)
  })

  it('calls purchase with lock address and any extra tip to be added on to key price', async () => {
    expect.assertions(1)
    const purchase = jest.fn()

    setPurchaseKeyCallback(purchase)

    await purchaseKey('lock', 'tip')
    expect(purchase).toHaveBeenCalledWith('lock', 'tip')
  })
})
