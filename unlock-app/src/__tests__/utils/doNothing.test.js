import doNothing from '../../utils/doNothing'

describe('the silliest test ever written', () => {
  it('should not do anything', () => {
    expect.assertions(1)
    const result = doNothing()

    expect(result).toBeUndefined()
  })
})
