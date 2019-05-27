import dispatchEvent from '../../unlock.js/dispatchEvent'

describe('dispatchEvent', () => {
  it('creates a CustomEvent with the specified detail and dispatches it on window', () => {
    expect.assertions(1)

    const spy = jest.spyOn(window, 'dispatchEvent')
    dispatchEvent(window, 'hi')

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: 'hi',
        type: 'unlockProtocol',
      })
    )
  })

  it('creates a CustomEvent with the specified detail and dispatches it on window (old way)', () => {
    expect.assertions(1)

    window.CustomEvent = function() {
      throw new Error('unsupported')
    }
    const spy = jest.spyOn(window, 'dispatchEvent')

    dispatchEvent(window, 'hi')

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: 'hi',
        type: 'unlockProtocol',
      })
    )
  })
})
