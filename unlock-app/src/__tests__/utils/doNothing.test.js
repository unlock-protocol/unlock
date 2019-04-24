import doNothing from '../../utils/doNothing'

describe('Do nothing (test coverage story helper)', () => {
  it('should not do anything', () => {
    expect.assertions(1)
    const result = doNothing()

    expect(result).toBeUndefined()
  })
})
